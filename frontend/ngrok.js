/**
 * Ngrok tunnel setup for exposing the frontend (Vite dev server) to the internet.
 *
 * Run:
 *   npm run dev   (in one terminal)
 *   npm run ngrok (in another terminal)
 */
import ngrok from 'ngrok';

const PORT = process.env.FRONTEND_PORT || 5173;

(async function () {
  try {
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTH_TOKEN, // optional
    });

    console.log('\n🌐 Frontend ngrok tunnel established!');
    console.log(`🖥️  Public URL: ${url}`);
    console.log(`➡️  For friends: open ${url} in a browser`);
    console.log('\nPress Ctrl+C to stop the tunnel\n');

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
    console.error('1) Install deps: cd frontend && npm install');
    console.error('2) Set ngrok authtoken (recommended):');
    console.error('   - Sign up/login at https://dashboard.ngrok.com/get-started/your-authtoken');
    console.error('   - Then in PowerShell (new terminal after setx):');
    console.error('       setx NGROK_AUTH_TOKEN \"<YOUR_TOKEN>\"');
    console.error('3) If corporate network/AV blocks ngrok, try another network or allow ngrok.');
    console.error(`\nNote: This script tunnels port ${PORT}. Make sure Vite is running on that port.`);
    process.exit(1);
  }
})();

