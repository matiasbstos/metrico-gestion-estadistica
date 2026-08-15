const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFirestoreWrite() {
  const projectId = 'metrico-dashboard-2026';
  const parent = `projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data`;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/artifacts/urgencias-dashboard/public/data/quota_test_col/quota_test_doc`;

  console.log('Testing Firestore REST API connection and write capability...');

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        timestamp: { integerValue: Date.now() },
        test: { stringValue: 'Quota Check' }
      }
    })
  });

  const status = res.status;
  const body = await res.json();

  console.log(`HTTP Status: ${status}`);
  console.log('Response Body:', JSON.stringify(body, null, 2));

  if (status === 429 || (body.error && body.error.message && body.error.message.includes('Quota'))) {
    console.error('CRITICAL: FIREBASE FIRESTORE QUOTA EXCEEDED (429 Resource Exhausted)!');
  } else if (status === 200 || status === 403) {
    console.log('Firestore is responsive (Quota is NOT exceeded for basic requests). Status:', status);
  }
}

testFirestoreWrite().catch(console.error);
