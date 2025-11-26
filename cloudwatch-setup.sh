#!/bin/bash
# CloudWatch Agent Setup Script for Digital Closet Backend
# Run this script on your EC2 instance

set -e

echo "========================================="
echo "CloudWatch Agent Setup for Digital Closet"
echo "========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Please run this script with sudo"
    exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS. Please install CloudWatch Agent manually."
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Step 1: Install CloudWatch Agent
echo "Step 1: Installing CloudWatch Agent..."
if [ "$OS" == "amzn" ] || [ "$OS" == "rhel" ] || [ "$OS" == "centos" ]; then
    # Amazon Linux / RHEL / CentOS
    wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
    sudo rpm -U ./amazon-cloudwatch-agent.rpm
    rm -f ./amazon-cloudwatch-agent.rpm
elif [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
    # Ubuntu / Debian
    wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
    sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
    rm -f ./amazon-cloudwatch-agent.deb
else
    echo "Unsupported OS. Please install CloudWatch Agent manually."
    exit 1
fi

echo "✓ CloudWatch Agent installed"
echo ""

# Step 2: Create log directory
echo "Step 2: Creating log directory..."
mkdir -p /var/log/digital-closet
chown ubuntu:ubuntu /var/log/digital-closet 2>/dev/null || chown ec2-user:ec2-user /var/log/digital-closet 2>/dev/null || true
chmod 755 /var/log/digital-closet
echo "✓ Log directory created: /var/log/digital-closet"
echo ""

# Step 3: Copy configuration file
echo "Step 3: Setting up CloudWatch Agent configuration..."
CONFIG_FILE="/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json"

# Check if config file exists in current directory
if [ -f "./cloudwatch-agent-config.json" ]; then
    cp ./cloudwatch-agent-config.json $CONFIG_FILE
    echo "✓ Configuration file copied from current directory"
elif [ -f "~/cloudwatch-agent-config.json" ]; then
    cp ~/cloudwatch-agent-config.json $CONFIG_FILE
    echo "✓ Configuration file copied from home directory"
else
    echo "⚠ Configuration file not found. Please copy cloudwatch-agent-config.json to $CONFIG_FILE"
    echo "You can create it manually or download from your repository."
fi
echo ""

# Step 4: Update systemd service file
echo "Step 4: Checking systemd service configuration..."
SERVICE_FILE="/etc/systemd/system/myapp.service"

if [ -f "$SERVICE_FILE" ]; then
    echo "Found service file: $SERVICE_FILE"
    echo "Please ensure it has the following log redirection:"
    echo "  StandardOutput=append:/var/log/digital-closet/app.log"
    echo "  StandardError=append:/var/log/digital-closet/error.log"
    echo ""
    echo "If not, update the service file and run:"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl restart myapp.service"
else
    echo "⚠ Service file not found at $SERVICE_FILE"
    echo "Please create or update your systemd service file."
fi
echo ""

# Step 5: Start CloudWatch Agent
echo "Step 5: Starting CloudWatch Agent..."
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify IAM role has CloudWatch permissions"
echo "2. Check agent status: sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status"
echo "3. View agent logs: sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
echo "4. Check application logs: tail -f /var/log/digital-closet/app.log"
echo "5. Verify in CloudWatch Console: https://console.aws.amazon.com/cloudwatch/"
echo ""

