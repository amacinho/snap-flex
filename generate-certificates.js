const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create certificates directory if it doesn't exist
const certDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

console.log('Generating self-signed SSL certificates for local development...');

try {
  // Generate a private key
  execSync(`openssl genrsa -out ${path.join(certDir, 'key.pem')} 2048`);
  
  // Generate a CSR (Certificate Signing Request)
  execSync(`openssl req -new -key ${path.join(certDir, 'key.pem')} -out ${path.join(certDir, 'csr.pem')} -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`);
  
  // Generate a self-signed certificate
  execSync(`openssl x509 -req -days 365 -in ${path.join(certDir, 'csr.pem')} -signkey ${path.join(certDir, 'key.pem')} -out ${path.join(certDir, 'cert.pem')}`);
  
  // Clean up the CSR file
  fs.unlinkSync(path.join(certDir, 'csr.pem'));
  
  console.log('SSL certificates generated successfully!');
  console.log(`Certificates saved to: ${certDir}`);
  console.log('\nIMPORTANT: These are self-signed certificates and will show security warnings in browsers.');
  console.log('You will need to manually trust these certificates in your browser or operating system.');
  console.log('For mobile testing, you may need to add these certificates to your device\'s trusted certificates.');
} catch (error) {
  console.error('Error generating SSL certificates:', error.message);
  console.error('Make sure OpenSSL is installed on your system.');
}
