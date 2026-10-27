import express from 'express';

const app = express();
const PORT = 3000;
app.use(express.json());
import type { Request, Response, NextFunction } from 'express';
//interfas de productos
interface Producto {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    activo: boolean;
}

//array de productos
let listaProductos: Producto [] = [
    {
        id: 1,
        nombre: "producto 1",
        precio: 10,
        stock: 10,
        activo: true,
    },
    {
        id: 2,
        nombre: "producto 2",
        precio: 20,
        stock: 20,
        activo: true,
    },
    {
        id: 3,
        nombre: "producto 3",
        precio: 30,
        stock: 30,
        activo: true,
    },
    {
        id: 4,
        nombre: "producto 4",
        precio: 40,
        stock: 40,
        activo: true,
    },
    {
        id: 5,
        nombre: "producto 5",
        precio: 50,
        stock: 50,
        activo: true,
    },
];

//validar producto (midelware)
///*
function validarProducto (req: Request, res: Response, next: NextFunction) {
    const { nombre, precio, stock, activo } = req.body;
    if (!nombre || precio <= 0 || !stock || !activo) {
        return res.status(400).json({
            ok: false,
            mensaje: "los datos son incorrectos o faltantes",
        });
    }
    next();
}
//*/
/*
export const validarProducto = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    res.status(400).json({ error: 'El nombre es obligatorio y debe ser texto.' });
    return;
  }

  if (typeof precio !== 'number' || precio <= 0) {
    res.status(400).json({ error: 'El precio debe ser un número mayor a 0.' });
    return;
  }

  next();
};
*/

//crear lista
app.get('/api/productos', function (req: Request, res: Response) {
    res.status(200).json({
        ok: true,
        mensaje: "lista de productos disponibles",
        data: listaProductos,
    });
});

//provar la lista para verficar el midelware
app.post('/api/productos/',validarProducto, function (req: Request, res: Response) {
    const { nombre, precio, stock, activo } = req.body;
    const nuevoProducto: Producto = {
        id: listaProductos.length + 1,
        nombre,
        precio,
        stock,
        activo: true,
    };
    listaProductos.push(nuevoProducto);
    res.status(201).json({
        ok: true,
        mensaje: "producto agregado correctamente",
        data: nuevoProducto,
    });
});

/* {
  "nombre": "producto 6",
  "precio": 60,
  "stock": 30,
  "activo": true
}*/

app.put('/api/productos/:id',validarProducto, function (req: Request, res: Response) {
    const { nombre, precio, stock, activo } = req.body;
    const id = Number(req.params.id);
    const producto = listaProductos.find((p) => p.id === id);
    if (!producto) {
        return res.status(404).json({
            ok: false,
            mensaje: "producto no encontrado",
        });
    }
    producto.nombre = nombre;
    producto.precio = precio;
    producto.stock = stock;
    producto.activo = activo;
    res.status(200).json({
        ok: true,
        mensaje: "producto actualizado correctamente",
        data: producto,
    });
});

/* {
  "nombre": "producto premium",
  "precio": 1000,
  "stock": 20,
  "activo": true
}*/

export const verificarRol = (rolMinimo: 'MODERADOR' | 'ADMIN') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const rol = req.headers['x-rol'];
    const esValido =
      rol === 'ADMIN' || (rolMinimo === 'MODERADOR' && rol === 'MODERADOR');
    if (!esValido) {
      return res.status(403).json({
        ok: false,
        error: `Acceso denegado. Se requiere rol ${rolMinimo}.`,
      });
    }
    next();
  };
};

//soft delete (moderador || admin)
app.patch('/api/productos/soft/:id',verificarRol('MODERADOR'), function (req: Request, res: Response) {
    const id = Number(req.params.id);
    const producto = listaProductos.find((p) => p.id === id);
    if (!producto) {
        return res.status(404).json({
            ok: false,
            mensaje: "producto no encontrado",
        });
    }
    producto.activo = false;
    res.status(200).json({
        ok: true,
        mensaje: "producto eliminado correctamente",
        data: producto,
    });
});


//hard delete (admin)
app.delete('/api/productos/delete/:id',verificarRol('ADMIN'), function (req: Request, res: Response) {
    const id = Number(req.params.id);
    const producto = listaProductos.find((p) => p.id === id);
    if (!producto) {
        return res.status(404).json({
            ok: false,
            mensaje: "producto no encontrado",
        });
    }
    listaProductos = listaProductos.filter((p) => p.id !== id);
    res.status(200).json({
        ok: true,
        mensaje: "producto eliminado correctamente",
        data: producto,
    });
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});