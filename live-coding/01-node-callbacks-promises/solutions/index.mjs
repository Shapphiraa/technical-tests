// 1 - Arregla esta función para que el código posterior funcione como se espera:

// Pasos:
// 1 - Siempre mirar los parámetros primero, aquí no se estaba pasando el callback
// 2 - Buscar dónde implementar el callback en caso del success (cambiado por el return)
// 3 - En el caso de error, el client.end() no se ejecutaba porque era inaccesible. Lo cambiamos arriba y abajo ponemos el callback (no hace falta poner el info porque le llega undefined)
// 4 - Añadir else en la llamada a la función

import net from 'node:net'

export const ping = (ip, callback) => {
  const startTime = process.hrtime()

  const client = net.connect({ port: 80, host: ip }, () => {
    client.end()
    callback(null, { time: process.hrtime(startTime), ip })
  })
  
  client.on('error', (err) => {
    client.end()
    callback(err)
  })
}

ping('midu.dev', (err, info) => {
  if (err) console.error(err)
  else console.log(info)
})

// 2 - Transforma la siguiente función para que funcione con promesas en lugar de callbacks:

export function obtenerDatosPromise1(callback) {
  setTimeout(() => {
    callback(null, { data: 'datos importantes' });
  }, 2000);
}

obtenerDatosPromise1((err, info) => {
  console.log(info)
})

// Transformación a promesas:

export function obtenerDatosPromise2() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 'datos importantes' })
    }, 2000)
  })
}
// Con then:
obtenerDatosPromise2()
.then(info => {
  console.log(info)
})

// Con await:
const info = await obtenerDatosPromise2()
console.log(info)

// 3 - Explica qué hace la funcion. Identifica y corrige los errores en el siguiente código. Si ves algo innecesario, elimínalo. Luego mejoralo para que siga funcionando con callback y luego haz lo que consideres para mejorar su legibilidad.

import fs from 'fs'

export function procesarArchivo(callback) {
  fs.readFile('input.txt', 'utf8', (error, contenido) => {
    if (error) {
      console.error('Error leyendo archivo:', error.message);
      // return false
      callback(error)
    }

    //setTimeout(() => {
      const textoProcesado = contenido.toUpperCase();

      fs.writeFile('output.txt', textoProcesado, error => {
        if (error) {
          console.error('Error guardando archivo:', error.message);
          // return false
          callback(error)
        }

        console.log('Archivo procesado y guardado con éxito');
        // return true
        callback(null)
      });

    //}, 1000);
  });
}

procesarArchivo(() => {
  console.log('Funciona')
})

// ¿Qué hace la función?
// Retorna mensaje de éxito o de error.
// 1 - Busca y lee el archivo 'input.txt'. Si no lo encuentra, devuelve el error 'Error leyendo archivo: <mensaje de error>' y corta la función.
// 2 - Después de 1 segundo: convierte el contenido del archivo a mayúsculas guardado en la variable textoProcesado.
// Crea (si no existe) y escribe en el archivo 'output.txt' el texto procesado. De nuevo si hay error nos devuelve el error. Si ha ido con éxito, nos devuelve un mensaje de éxito.

// Mejora de legibilidad pasando a async await y utilizando el promises del fs:

import fsp from 'fs/promises'

export async function procesarArchivoPromise() {
  let contenido = ''
  
  try {
    contenido = await fsp.readFile('input.txt', 'utf8')
  } catch (error) {
    console.error('Error leyendo archivo:', error.message)
    throw error
  }

  const textoProcesado = contenido.toUpperCase()

  try {
    await fsp.writeFile('output.txt', textoProcesado)
  } catch (error) {
    console.error('Error guardando archivo:', error.message)
    throw error
  }

  console.log('Archivo procesado y guardado con éxito')
  
}

await procesarArchivoPromise()

// 4 - ¿Cómo mejorarías el siguiente código y por qué? Arregla los tests si es necesario:

// ¿Qué se ha hecho? Convertir el código en asíncrono con async await para optimizar los tiempos. No se puede ver a simple vista el cambio, pero de esta forma mientras se está leyendo cada archivo, el código de después puede ir leyéndose o hacer otras cosas, sin estar bloqueado totalmente. Aunque esta opción sigue siendo secuencial (se leen uno detrás de otro).

export async function leerArchivos() {
  const archivo1 = await fsp.readFile('archivo1.txt', 'utf8');
  const archivo2 = await fsp.readFile('archivo2.txt', 'utf8');
  const archivo3 = await fsp.readFile('archivo3.txt', 'utf8');

  return `${archivo1} ${archivo2} ${archivo3}`
}

leerArchivos();

// ¿Qué se ha hecho? Cambiar la lectura a paralelo. No dependen unos de otros (no hay que esperar a que se lea uno para leer otro) y se pueden hacer las tres lecturas a la vez. Hacemos un Promise.all para resolver todas las promesas al mismo tiempo. Así sí se nota mucho más la mejora de rendimiento en el tiempo que tarda.

export async function leerArchivos2() {
  const [archivo1, archivo2, archivo3] = await Promise.all([
    fsp.readFile('archivo1.txt', 'utf8'), fsp.readFile('archivo2.txt', 'utf8'), fsp.readFile('archivo3.txt', 'utf8')
  ])

  return `${archivo1} ${archivo2} ${archivo3}`
}

leerArchivos2();

// 5 - Escribe una funcion `delay` que retorne una promesa que se resuelva después de `n` milisegundos. Por ejemplo:

export async function delay (n) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, n)
    // o setTimeout(resolve, n)
  })
}

delay(3000).then(() => console.log('Hola mundo'));
// o..
await delay(3000)
console.log('Hola mundo')

// 6. Vamos a crear nuestra propia utilidad `dotenv` en el archivo `dotenv.js`.

// - La utilidad debe devolver un método `config` que lee el archivo `.env` y añade las variables de entorno que haya en el archivo al objeto `process.env`.

// - Por ejemplo si tu archivo `.env` contiene:

```sh
PORT=8080
TOKEN="123abc"
```

// Entonces podríamos hacer esto:

const dotenv = require("./dotenv.js");
dotenv.config()

console.log(process.env.PORT) // "8008"
console.log(process.env.TOKEN) // "123abc"

// También se le puede pasar el path del archivo `.env` como parámetro:

const dotenv = require("./dotenv.js");
dotenv.config("./config/.env.local")

// Cosas a tener en cuenta:
 
// - Sólo se permite usar el módulo `fs` para leer el archivo.
// - Si el archivo no existe, no debe dar error, simplemente no hace nada.
// - Si el archivo existe, pero no tiene ninguna variable de entorno, no debe hacer nada.
// - Sólo debe soportar el archivo `.env` o el que se le pasa como parametro, no hace falta que soporte `.env.local`, `.env.development` y similares de forma automática.
// - Las variables de entorno siempre son strings, por lo que si en el archivo `.env` hay un número, por ejemplo `PORT=8080`, al leerlo con `fs` y añadirlo a `process.env` debe ser un string, no un número.
// - `process.env` es un objeto y, por lo tanto, es mutable. Esto significa que podemos añadir propiedades nuevas sin problemas.