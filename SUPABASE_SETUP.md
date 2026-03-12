# FinControl - Configuración de Supabase

Sigue estos pasos para configurar la base de datos de FinControl en Supabase:

## 1. Crear el proyecto en Supabase
1. Ve a [Supabase](https://supabase.com/) e inicia sesión.
2. Crea un nuevo proyecto.
3. Copia la **URL del Proyecto** y tu **Anon Key** (las encontrarás en Project Settings -> API).

## 2. Configurar Autenticación
1. Ve a **Authentication** -> **Providers**.
2. Asegúrate de que **Email** esté habilitado.
3. Activa la opción de **Confirm email** para requerir que los usuarios validen su correo.
4. (Opcional) Personaliza las plantillas de correo en **Authentication** -> **Email Templates**.

## 3. Ejecutar el Script SQL
1. En tu panel de Supabase, ve al menú **SQL Editor**.
2. Da clic en **New query** (Nueva consulta).
3. Copia todo el contenido del archivo `database/schema.sql` y pégalo allí.
4. Presiona el botón **Run** (Ejecutar) para crear todas las tablas, funciones, triggers y políticas RLS.

## 4. Políticas de Seguridad (RLS)
El script SQL ya incluye las políticas necesarias:
- Los usuarios solo pueden ver y editar sus propios datos.
- El usuario `logiliontec@gmail.com` recibirá automáticamente el rol de `admin` al registrarse y podrá ver todos los usuarios.

## 5. Configurar Variables de Entorno en la Aplicación
1. Abre el archivo `js/supabaseClient.js`.
2. Reemplaza `TU_SUPABASE_URL` y `TU_SUPABASE_ANON_KEY` por tu URL y Anon Key respectivamente.

## 6. (Opcional) Activar Integración de Pagos
Si vas a usar Stripe o MercadoPago, te recomendamos usar Supabase Edge Functions para procesar Webhooks o crear los Checkout Sessions de forma segura. En este nivel, la interfaz ya viene preparada para enviar las solicitudes; solo precisarás agregar tus llaves públicas a un script `js/payments.js`.
