/**
 * Test: GET /api/admin/users (Requiere Login Admin)
 */
 testUtils.createTestButton("Test Admin: Listar Usuarios con Login Admin Correcto", async (btn) => {
    // Primero hacemos un login rápido como admin para obtener el token adecuado
    const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: '12345' })
    });
    
    const { token } = await loginRes.json();

    const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    testUtils.log(data);
    if (response.ok) testUtils.setSuccess(btn);
});

/**
 * Test: GET /api/admin/users con rol "producer" (debe ser rechazado con 403)
 */
testUtils.createTestButton("Test Seguridad - Productor accediendo a Admin", async (btn) => {
    // 1. Asegurar sesión como productor (pepe) mediante okLogin()
    await okLogin();
    const token = localStorage.getItem('test_token');

    // 2. Intentar acceder a una ruta de administrador con ese token
    const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    testUtils.log(data, true); // se muestra como error (rojo) en la consola

    // 3. Éxito si el status es 403 y el mensaje indica acceso denegado
    if (response.status === 403 && data.message.includes('Acceso denegado')) {
        testUtils.setSuccess(btn);
    }
});
