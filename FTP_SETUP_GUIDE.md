# FTP Image Storage Setup Guide

## Overview
This guide explains how to set up FTP-based image storage for your AI T-Shirt Designer application. This will solve the image expiration problem by saving images as actual files on your server.

## Environment Variables Required

Add these to your `.env.local` file:

```env
# FTP Configuration for Image Storage
FTP_HOST=your-ftp-host.com
FTP_PORT=21
FTP_USERNAME=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_BASE_PATH=/public_html/images/orders

# Image Base URL (where images will be served from)
NEXT_PUBLIC_IMAGE_BASE_URL=https://yourdomain.com/images
```

## FTP Server Setup

### 1. Create Base Directory
Create the base directory on your FTP server:
```
/public_html/images/orders/
```

### 2. Set Permissions
Ensure the directory has write permissions:
```bash
chmod 755 /public_html/images/orders/
```

### 3. Directory Structure
The system will create folders like this:
```
/public_html/images/orders/
├── order_1/
│   └── design_1_1234567890.png
├── order_2/
│   └── design_2_1234567891.png
└── order_3/
    └── design_3_1234567892.png
```

## How It Works

### 1. Image Generation
- When a user generates a design, the temporary OpenAI URL is downloaded
- The image is saved to FTP in a folder named `order_{orderId}`
- The database is updated with the permanent file URL

### 2. Image Display
- When displaying orders, temporary URLs are automatically converted
- Images are served from your FTP server instead of temporary URLs
- No more expiration issues!

### 3. File Naming
- Files are named: `design_{orderId}_{timestamp}.{extension}`
- Example: `design_123_1703123456789.png`

## Benefits

✅ **No More Expiration**: Images never expire
✅ **Better Performance**: File-based storage is faster
✅ **Easy Management**: Images organized by order
✅ **WooCommerce Ready**: Perfect for e-commerce integration
✅ **Backup Friendly**: Easy to backup and restore

## Testing

1. Set up your FTP credentials in `.env.local`
2. Generate a new design
3. Check your FTP server for the new folder and image
4. Verify the image displays correctly in orders

## Troubleshooting

### Images Still Not Loading
- Check FTP credentials are correct
- Verify directory permissions
- Check `NEXT_PUBLIC_IMAGE_BASE_URL` is correct
- Look at browser console for errors

### FTP Connection Issues
- Test FTP credentials with an FTP client
- Check firewall settings
- Verify port 21 is open

### Permission Errors
- Ensure FTP user has write access to the directory
- Check directory permissions (755 or 777)

## Production Considerations

1. **Security**: Use SFTP instead of FTP for better security
2. **CDN**: Consider using a CDN for better performance
3. **Backup**: Set up regular backups of the images directory
4. **Monitoring**: Monitor disk space usage
5. **SSL**: Ensure images are served over HTTPS

## Next Steps

1. Configure your FTP settings
2. Test with a new design
3. Verify images are saved correctly
4. Check that existing orders now display images properly
