const listaPokemon = document.getElementById('pokemonList');
const inputBusquedaPokemon = document.getElementById('pokemonSearch');
const btnAgregarPokemon = document.getElementById('addPokemonBtn');
const btnResetear = document.getElementById('resetBtn');
const btnHistorial = document.getElementById('historyBtn');
const modalHistorial = document.getElementById('historyModal');
const listaHistorial = document.getElementById('historyList');
const btnCerrar = document.getElementsByClassName('close')[0];

let equipoActual = [];
let historialEquipos = [];

async function buscarPokemon(terminoBusqueda) {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${terminoBusqueda.toLowerCase()}`);
  if (!respuesta.ok) {
    throw new Error('El pokemon no existe, prueba con otro nombre o ID.');
  }
  const datos = await respuesta.json();
  return datos;
}

async function obtenerNivelPokemon(pokemon) {
  try {
    const respuesta = await fetch(pokemon.species.url);
    if (!respuesta.ok) {
      throw new Error('Error al obtener los datos del Pokémon');
    }
    const datosEspecie = await respuesta.json();
    const respuestaEspecie = await fetch(datosEspecie.varieties[0].pokemon.url);
    if (!respuestaEspecie.ok) {
      throw new Error('Error al obtener los detalles del Pokémon');
    }
    const datosDetallesPokemon = await respuestaEspecie.json();
    return calcularNivel(datosDetallesPokemon);
  } catch (error) {
    console.error(error);
    return 'N/A'; // En caso de error, se muestra N/A como nivel
  }
}

function calcularNivel(pokemon) {
  const velocidadBase = pokemon.stats[0].base_stat;
  const nivel = Math.floor(velocidadBase / 10); // Esto es solo un ejemplo de fórmula de cálculo
  return nivel;
}

function mostrarPokemon(pokemon) {
  obtenerNivelPokemon(pokemon)
    .then(nivel => {
      const tarjetaPokemon = `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${pokemon.name}</h5>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid mb-2">
            <p class="card-text">ID: ${pokemon.id}</p>
            <p class="card-text">Tipo: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p class="card-text">Nivel: ${nivel}</p>
          </div>
        </div>
      `;
      listaPokemon.innerHTML += tarjetaPokemon;
    })
    .catch(error => {
      console.error(error);
      alert('Ha ocurrido un error al obtener los datos del Pokémon.');
    });
}

async function agregarPokemon() {
  if (equipoActual.length < 3) {
    const terminoBusqueda = inputBusquedaPokemon.value.trim();
    try {
      const pokemon = await buscarPokemon(terminoBusqueda);
      
      // Verificar si el Pokémon ya está en el equipo actual
      if (equipoActual.some(p => p.id === pokemon.id)) {
        alert('Este Pokémon ya ha sido seleccionado para el equipo.');
        return;
      }

      mostrarPokemon(pokemon);
      equipoActual.push(pokemon);
    } catch (error) {
      alert(error.message);
    }
  } else {
    alert('Ya has seleccionado 3 Pokemones. Crea un nuevo equipo.');
  }
}


function reiniciarEquipo() {
  if (equipoActual.length > 0) {
    historialEquipos.push([...equipoActual]);
    equipoActual = [];
    listaPokemon.innerHTML = '';
  } else {
    alert('No hay Pokemones agregados.');
  }
}function mostrarHistorial() {
  listaHistorial.innerHTML = '';
  historialEquipos.forEach((equipo, index) => {
    historialEquipos.sort((a, b) => a.index - b.index); // Ordenar los equipos por el índice
    const itemEquipo = document.createElement('li');
    const equipoHTML = document.createElement('div');
    equipoHTML.classList.add('historialEquipo'); // Agrega clase para estilos
    equipoHTML.innerHTML = `<h5 class="equipoNombre">Equipo ${index + 1}</h5>`;
    
    equipo.forEach(pokemon => {
      const pokemonHTML = document.createElement('div');
      pokemonHTML.classList.add('historialPokemon'); // Agrega clase para estilos
      pokemonHTML.innerHTML = `
        <h6>${pokemon.name}</h6>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid">
        <p>ID: ${pokemon.id}</p>
        <p>Tipo: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p>Nivel: ${pokemon.nivel}</p>
      `;
      equipoHTML.appendChild(pokemonHTML);
    });
    itemEquipo.appendChild(equipoHTML);
    listaHistorial.appendChild(itemEquipo);
  });
  modalHistorial.style.display = 'block';
}



btnAgregarPokemon.addEventListener('click', agregarPokemon);
btnResetear.addEventListener('click', reiniciarEquipo);
btnHistorial.addEventListener('click', mostrarHistorial);
