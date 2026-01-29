/**
 * Ngrok tunnel setup for exposing local server to internet
 * Run this separately: node ngrok.js
 */
import ngrok from 'ngrok';

const PORT = process.env.PORT || 3001;

(async function() {
  try {
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTH_TOKEN, // Optional: set in .env for persistent URLs
    });
    
    console.log('\n🌐 Ngrok tunnel established!');
    console.log(`📡 Public URL: ${url}`);
    console.log(`🔗 Backend accessible at: ${url}`);
    console.log(`\n⚠️  Update frontend SocketContext.jsx to use: ${url}`);
    console.log(`\nPress Ctrl+C to stop the tunnel\n`);
    
    // Keep the process running
    process.on('SIGINT', async () => {
      await ngrok.disconnect();
      await ngrok.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Ngrok error: failed to start tunnel');
    console.error('Message:', error?.message);
    if (error?.stack) console.error('Stack:\n', error.stack);

    console.error('\nCommon fixes:');
    console.error('1) Install deps: cd backend && npm install');
    console.error('2) Set ngrok authtoken (recommended):');
    console.error('   - Sign up/login at https://dashboard.ngrok.com/get-started/your-authtoken');
    console.error('   - Then in PowerShell (new terminal after setx):');
    console.error('       setx NGROK_AUTH_TOKEN \"<YOUR_TOKEN>\"');
    console.error('3) If corporate network/AV blocks ngrok, try another network or allow ngrok.');
    console.error(`\nNote: This script tunnels port ${PORT}. Make sure backend is running on that port.`);
    process.exit(1);
  }
})();
