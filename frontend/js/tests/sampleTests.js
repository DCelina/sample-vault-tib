/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin()
 {
    // 1. Login como productor (pepe) para obtener un token válido
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token', data.token);
 }

/**
 * Test: GET /api/samples/my-samples
 */
 testUtils.createTestButton("Test Listar Mis Samples", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // 2. Realizar la petición
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test: POST /api/samples/upload (Simulado)
 */
testUtils.createTestButton("Test Subir Sample (Simulado)", async (btn) => {
    // 1. Asegurar y guardar una sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');
    
    // Creamos un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test: DELETE /api/samples/:id (el id se obtiene dinámicamente)
 */
testUtils.createTestButton("Test Eliminar Sample Dinámico", async (btn) => {
    // 1. Asegurar sesión válida
    await okLogin();
    const token = localStorage.getItem('test_token');

    // 2. Obtener la lista actual de samples del usuario
    const listRes = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const samples = await listRes.json();

    // 3. Validar existencia
    if (!Array.isArray(samples) || samples.length === 0) {
        testUtils.log("Advertencia: no hay samples para eliminar. Subí un sample primero (Test Subir Sample).", true);
        return; // el botón queda amarillo: el test no pudo ejecutarse
    }

    const targetId = samples[0].id;
    testUtils.log(`Intentando borrar el sample con ID: ${targetId}`);

    // 4. Ejecutar la eliminación inyectando el ID en la URL
    const response = await fetch(`/api/samples/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    testUtils.log({ idEliminado: targetId, respuesta: data });

    if (response.ok) {
        testUtils.setSuccess(btn);
    }
});

/**
 * Test: POST /api/samples/upload sin category ni display_name (debe dar 400)
 */
testUtils.createTestButton("Test Subir Sample - Error por Datos Faltantes", async (btn) => {
    await okLogin();
    const token = localStorage.getItem('test_token');

    // FormData solo con el archivo: se omiten a propósito category y display_name
    const formData = new FormData();
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DATOS_FALTANTES.wav');

    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // sin Content-Type: lo arma el navegador
        body: formData
    });

    const data = await response.json();
    testUtils.log(data);

    // El servidor debe rechazar la petición por validación (400 Bad Request)
    if (response.status === 400) {
        testUtils.setSuccess(btn);
    }
});
