# Bank Frontend 🏦

Frontend web de una aplicación bancaria desarrollado con **Angular**, encargado de la gestión de clientes, cuentas, movimientos y reportes financieros, consumiendo un backend REST construido en **Spring Boot**.

Este proyecto forma parte de una solución full stack orientada a buenas prácticas, arquitectura modular y facilidad de despliegue.

---

## 🚀 Tecnologías utilizadas

- **Angular** (standalone components)
- **TypeScript**
- **HTML5 / CSS3**
- **RxJS**
- **Docker** (contenedorización)
- **Node.js / npm**

---

## 📁 Estructura del proyecto

src/app
├── core
│ └── services # Servicios HTTP y lógica de acceso a la API
├── layout
│ ├── sidebar # Componentes de navegación
│ └── layout.* # Layout principal
├── models # Interfaces y modelos de dominio
├── pages
│ ├── clientes # Gestión de clientes
│ ├── cuentas # Gestión de cuentas
│ ├── movimientos # Movimientos bancarios
│ └── reportes # Reportes y estados de cuenta
├── app.config.ts
├── app.routes.ts
└── main.ts

yaml
Copiar código

Arquitectura pensada para:
- Separación de responsabilidades
- Escalabilidad
- Fácil mantenimiento

---

## 🔗 Backend

El frontend consume una API REST desarrollada en Spring Boot.

Repositorio del backend:  
👉 **https://github.com/JF92LP/bank-backend**

Por defecto, el backend se espera en:

http://localhost:8080

yaml
Copiar código

La configuración de llamadas HTTP se centraliza en:
src/app/core/services/api.service.ts

yaml
Copiar código

---

## ⚙️ Instalación y ejecución local

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/JF92LP/bank-frontend.git
cd bank-frontend
2️⃣ Instalar dependencias
bash
Copiar código
npm install
3️⃣ Ejecutar en modo desarrollo
bash
Copiar código
ng serve
La aplicación estará disponible en:

arduino
Copiar código
http://localhost:4200
🐳 Ejecución con Docker
Construir la imagen
bash
Copiar código
docker build -t bank-frontend .
Ejecutar el contenedor
bash
Copiar código
docker run -p 4200:80 bank-frontend
La aplicación estará disponible en:

arduino
Copiar código
http://localhost:4200
🧪 Pruebas
El proyecto incluye pruebas unitarias básicas para componentes y servicios.

Ejecutar pruebas:

bash
Copiar código
ng test
📌 Funcionalidades principales
Gestión de clientes

Gestión de cuentas bancarias

Registro de movimientos (débitos / créditos)

Visualización de reportes financieros

Consumo de API REST

Navegación estructurada por módulos

📄 Notas técnicas
Se utiliza Angular standalone (sin módulos clásicos)

Código organizado por dominio funcional

Pensado para integrarse fácilmente con CI/CD

Compatible con despliegue en contenedores

👨‍💻 Autor
J. Francisco Luzuriaga
Desarrollador de software
GitHub: https://github.com/JF92LP

📜 Licencia
Este proyecto se distribuye con fines educativos y de evaluación técnica.


# BankFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
