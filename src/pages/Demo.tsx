import React, { useState, useEffect } from "react";
import PropertyComponent from "../components/Property";
const Demo: React.FC = () => {

    //Este es el ciclo de vida del componente
    useEffect(() => {
        console.log("Componente montado");
        return () => {
            console.log("Componente desmontado");
        };
    }, []);

    //Este es el TS
    //Nombre como variable reactiva
    //Esta variable sí permite cambiar su valor en el html
    let [name, setName] = useState("Alejandro");

    //Estas solo permiten ver la variable en el html
    let edad: number = 319;
    let activo: boolean = true;
    let lista: number[] = [1, 2, 3, 4, 5];
    let listaStr: Array<string> = ["uno", "dos", "tres"];
    let listaStr2: string[] = ["cuatro", "cinco", "seis"];
    let tupla: [string, number] = ["Hola", 123];
    enum Color { Rojo, Verde, Azul }
    let colorFavorito: Color = Color.Verde;
    let cualquiera: any = "Puede ser cualquier cosa";
    let sinTipo: unknown = 42;

    // Función para manejar los cambios en la caja de texto
    const manejarCambio = (event: any) => {
        setName(event.target.value); // Actualizar el estado con el valor del input
    };
    // Función para manejar el clic en el botón
    const manejarClick = () => {
        console.log(`Hola, ${name}`); // Mostrar el saludo en la consola
    }

    //Este es el HTML
    return  <div>
                <p>Hola mundo {name}</p>
                <p>Edad: {edad}</p>
                <p>{edad>=18 ? "Mayor de edad":"Menor de edad"}</p> {/* Operador ternario (condicional) */}
                <p>Numeros:</p>
                <ul className="activo ? 'activo' : 'inactivo'"> {/* Operador ternario (condicional) */}
                    {listaStr2.map(numero => <li>{numero}</li>)} {/* Función lamda (mapeo = foreach) */}
                </ul>
                <input
                    type="text"
                    value={name} // El valor del input está ligado al estado 'texto'
                    onChange={manejarCambio} // Se actualiza el estado cada vez que el usuario escribe
                />
                <button onClick={manejarClick}>Saludar</button>

                <div className="row container">
                    <div className="col-3">
                        <PropertyComponent name="Propiedad 1" color="red" price={100} rent={[35, 175, 500]} />
                    </div>
                </div>
            </div>
}
export default Demo;