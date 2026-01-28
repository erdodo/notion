import { test as setup } from '@playwright/test';

setup('ensure database is ready', async () => {
  // Wait for database to be ready
  const maxRetries = 10;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/health');
      if (response.ok) {
        console.log('Server is ready');
        return;
      }
    } catch (error) {
      console.log(`Waiting for server... (${retries + 1}/${maxRetries})`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    retries++;
  }
  
  console.log('Server ready check completed');
});
