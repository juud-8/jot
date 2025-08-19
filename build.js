#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
require('dotenv').config();

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Get environment variables with fallbacks
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Replace the environment configuration in the HTML
const envConfig = `window.ENV = {
			SUPABASE_URL: '${supabaseUrl}',
			SUPABASE_ANON_KEY: '${supabaseAnonKey}'
		};`;

html = html.replace(
	/window\.ENV = \{[\s\S]*?\};/,
	envConfig
);

// Write the processed HTML to dist/index.html
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
	fs.mkdirSync(distDir);
}

fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Copy other files to dist
const filesToCopy = ['style.css', 'app.js'];
filesToCopy.forEach(file => {
	const sourcePath = path.join(__dirname, file);
	const destPath = path.join(distDir, file);
	if (fs.existsSync(sourcePath)) {
		fs.copyFileSync(sourcePath, destPath);
	}
});

console.log('Build completed! Files are in the dist/ directory.');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'NOT SET');
