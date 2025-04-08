// Módulos necesarios (crear servidro HTTP, manejar URLs, información del sitema)
const http = require("http");
const url = require("url");
const os = require("os"); 

// Estructura básica del servidor (1)
const hostname = "127.0.0.1";
const port = 3000;

// Función para obtener información del sistema
const getSystemInfo = () => {
    return {
        platform: os.platform(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB',
        uptime: Math.round(os.uptime() / 3600) + ' horas'
    };
};

// Función para obtener estadísticas de visitas
let visitCount = {
    total: 0,
    routes: {}
};

// Función para obtener fecha y hora en español
const getDateTime = () => {
    return new Date().toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Sistema de Rutas
const routes = {
    "/": () => `¡Bienvenido al servidor Node.js!<br>
                Esta página ha sido visitada ${visitCount.routes["/"] || 0} veces`,
    
    "/info": () => {
        const sysInfo = getSystemInfo();
        return `
            <h2>Información del Sistema:</h2>
            <ul>
                <li>Plataforma: ${sysInfo.platform}</li>
                <li>Hostname: ${sysInfo.hostname}</li>
                <li>Núcleos CPU: ${sysInfo.cpus}</li>
                <li>Memoria Total: ${sysInfo.memory}</li>
                <li>Tiempo activo: ${sysInfo.uptime}</li>
            </ul>
        `;
    },

    "/hora": () => `
        <h2>Fecha y Hora Actual:</h2>
        <div id="datetime">${getDateTime()}</div>
        <script>
            setInterval(() => {
                fetch('/hora-actual')
                    .then(response => response.text())
                    .then(time => document.getElementById('datetime').innerHTML = time);
            }, 1000);
        </script>
    `,

    "/hora-actual": () => getDateTime(),

    "/contador": () => `
        <h2>Estadísticas de Visitas:</h2>
        <p>Visitas totales al servidor: ${visitCount.total}</p>
        <ul>
            ${Object.entries(visitCount.routes).map(([route, count]) => 
                `<li>Ruta ${route}: ${count} visitas</li>`
            ).join('')}
        </ul>
    `
};

// Estructura básica del servidor (2)
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;

    // Incrementar contadores de visitas
    visitCount.total++;
    visitCount.routes[path] = (visitCount.routes[path] || 0) + 1;

    // Configurar headers
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // Estilo común para todas las páginas
    const commonStyle = `
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f0f0f0;
            }
            nav { 
                background-color: #333;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            nav a { 
                color: white;
                text-decoration: none;
                margin: 0 10px;
                padding: 5px 10px;
            }
            nav a:hover {
                background-color: #555;
                border-radius: 3px;
            }
            h1, h2 { color: #333; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 10px 0; padding: 10px; background-color: white; border-radius: 5px; }
        </style>
    `;

    // Manejo de errores
    if (routes[path]) {
        res.statusCode = 200;
        if (path === '/hora-actual') {
            res.end(routes[path]());
        } else {
            res.end(`
                <html>
                    <head>
                        <title>Servidor Node.js</title>
                        ${commonStyle}
                    </head>
                    <body>
                        <nav>
                            <a href="/">Inicio</a>
                            <a href="/info">Info Sistema</a>
                            <a href="/hora">Hora</a>
                            <a href="/contador">Contador</a>
                        </nav>
                        <h1>${routes[path]()}</h1>
                    </body>
                </html>
            `);
        }
    } else {
        res.statusCode = 404;
        res.end(`
            <html>
                <head>
                    <title>404 - No encontrado</title>
                    ${commonStyle}
                </head>
                <body>
                    <h1>404 - Página no encontrada</h1>
                    <p>La página que buscas no existe.</p>
                    <a href="/">Volver al inicio</a>
                </body>
            </html>
        `);
    }
});

// Estructura básica del servidor (3)
server.listen(port, hostname, () => {
    console.log(`Servidor corriendo en http://${hostname}:${port}/`);
});