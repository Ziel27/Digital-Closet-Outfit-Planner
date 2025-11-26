# CloudWatch Agent Setup Guide for Digital Closet Backend

This guide will help you set up AWS CloudWatch Agent to collect logs and metrics from your EC2 instance.

## Prerequisites

1. EC2 instance running your backend application
2. AWS CLI configured (or IAM role with CloudWatch permissions)
3. SSH access to your EC2 instance

## Step 1: Set Up IAM Permissions

### Option A: Attach IAM Role to EC2 Instance (Recommended)

1. Go to **EC2 Console** → Select your instance → **Actions** → **Security** → **Modify IAM role**
2. Attach a role with the `CloudWatchAgentServerPolicy` policy
3. If you don't have a role, create one:
   - Go to **IAM Console** → **Roles** → **Create role**
   - Select **EC2** as the service
   - Attach policy: `CloudWatchAgentServerPolicy`
   - Name it: `CloudWatchAgentServerRole`
   - Attach this role to your EC2 instance

### Option B: Use AWS CLI with Credentials

If you're using AWS CLI with credentials, ensure your user has CloudWatch permissions.

## Step 2: Upload Configuration Files to EC2

Upload these files to your EC2 instance:

```bash
# From your local machine
scp cloudwatch-agent-config.json ubuntu@your-ec2-ip:~/
scp cloudwatch-setup.sh ubuntu@your-ec2-ip:~/
```

Or clone your repository on EC2:

```bash
# On EC2
cd ~
git clone https://github.com/Ziel27/Digital-Closet-Outfit-Planner.git
cd Digital-Closet-Outfit-Planner
```

## Step 3: Run Setup Script

SSH into your EC2 instance and run:

```bash
# Make script executable
chmod +x cloudwatch-setup.sh

# Run setup script
sudo ./cloudwatch-setup.sh
```

Or follow manual steps below.

## Step 4: Manual Setup (Alternative)

### 4.1 Install CloudWatch Agent

**For Amazon Linux / RHEL / CentOS:**
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

**For Ubuntu / Debian:**
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

### 4.2 Create Log Directory

```bash
sudo mkdir -p /var/log/digital-closet
sudo chown ubuntu:ubuntu /var/log/digital-closet  # or ec2-user:ec2-user
sudo chmod 755 /var/log/digital-closet
```

### 4.3 Copy Configuration File

```bash
sudo cp cloudwatch-agent-config.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

### 4.4 Update Systemd Service File

Edit your systemd service file:

```bash
sudo nano /etc/systemd/system/myapp.service
```

Update it to redirect logs:

```ini
[Unit]
Description=Node.js App
After=network.target multi-user.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/Digital-Closet-Outfit-Planner/backend
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/etc/app.env
StandardOutput=append:/var/log/digital-closet/app.log
StandardError=append:/var/log/digital-closet/error.log
SyslogIdentifier=digital_closet_server
RestartSec=2

[Install]
WantedBy=multi-user.target
```

Reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart myapp.service
```

### 4.5 Start CloudWatch Agent

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s
```

## Step 5: Verify Setup

### Check Agent Status

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status
```

Expected output should show the agent is running.

### Check Agent Logs

```bash
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

### Check Application Logs

```bash
tail -f /var/log/digital-closet/app.log
tail -f /var/log/digital-closet/error.log
```

### Verify in CloudWatch Console

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Navigate to **Logs** → **Log groups**
3. You should see:
   - `/aws/ec2/digital-closet/application`
   - `/aws/ec2/digital-closet/errors`
4. Click on a log group to view log streams

## Step 6: Set Log Retention (Optional)

To control costs, set log retention:

```bash
aws logs put-retention-policy \
  --log-group-name "/aws/ec2/digital-closet/application" \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name "/aws/ec2/digital-closet/errors" \
  --retention-in-days 90
```

Or via Console: **Log groups** → Select group → **Actions** → **Edit retention**

## Step 7: Create CloudWatch Alarms (Optional)

Monitor errors automatically:

1. Go to **CloudWatch** → **Alarms** → **Create alarm**
2. Select metric: `/aws/ec2/digital-closet/errors`
3. Set threshold (e.g., > 10 errors in 5 minutes)
4. Configure SNS notification

## Troubleshooting

### Agent Not Starting

```bash
# Check agent status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status

# View agent logs
sudo tail -50 /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

# Restart agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a stop
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a start
```

### No Logs Appearing

1. **Check log files exist:**
   ```bash
   ls -la /var/log/digital-closet/
   tail -f /var/log/digital-closet/app.log
   ```

2. **Check application is writing logs:**
   ```bash
   sudo systemctl status myapp.service
   sudo journalctl -u myapp.service -f
   ```

3. **Check IAM permissions:**
   ```bash
   aws sts get-caller-identity
   aws logs describe-log-groups --log-group-name-prefix "/aws/ec2/digital-closet"
   ```

### Logs Not in CloudWatch

1. **Verify configuration:**
   ```bash
   sudo cat /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
   ```

2. **Check log groups exist:**
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/ec2/digital-closet"
   ```

3. **Manually create log groups if needed:**
   ```bash
   aws logs create-log-group --log-group-name "/aws/ec2/digital-closet/application"
   aws logs create-log-group --log-group-name "/aws/ec2/digital-closet/errors"
   ```

## CloudWatch Logs Insights Queries

Once logs are in CloudWatch, you can use these queries:

### Find All Errors
```sql
fields @timestamp, level, message, requestId
| filter level = "ERROR"
| sort @timestamp desc
| limit 100
```

### Find Errors by Request ID
```sql
fields @timestamp, message, requestId, data
| filter level = "ERROR" and requestId = "your-request-id"
| sort @timestamp desc
```

### Count Errors by Message
```sql
fields level, message
| filter level = "ERROR"
| stats count() by message
| sort count desc
```

### Find Slow Requests
```sql
fields @timestamp, message, data.duration, requestId
| filter message like /GET|POST|PUT|DELETE/
| filter data.duration > 1000
| sort data.duration desc
| limit 50
```

### Error Rate Over Time
```sql
fields @timestamp, level
| filter level = "ERROR"
| stats count() by bin(5m)
| sort @timestamp desc
```

## Cost Optimization

- Set log retention (30-90 days recommended)
- Use log filters to reduce ingested logs
- Monitor CloudWatch costs in AWS Cost Explorer
- Consider using CloudWatch Logs Insights only when needed

## Next Steps

1. Set up CloudWatch Alarms for critical errors
2. Create CloudWatch Dashboards for monitoring
3. Configure SNS notifications for alerts
4. Set up log-based metrics for custom monitoring

