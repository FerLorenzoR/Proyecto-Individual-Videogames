const { Router, response } = require("express");
const videogameRoute = Router();
const { default: axios } = require("axios");
const { Videogame, Genre } = require("../db");
const { Op } = require("sequelize");
const { API_KEY } = process.env;
const API = `https://api.rawg.io/api/games?key=${API_KEY}`;

videogameRoute.get("/", async (req, res) => {
  const searchName = req.query.name;

  try {
    let games = [];
    if (!searchName) {
      games = await Videogame.findAll({
        include: [
          { model: Genre, attributes: ["name"], through: { attributes: [] } },
        ],
      });
      const videogamesApiData = await axios.get(API);
      const apiAllVideogames = videogamesApiData.data.results.map((game) => {
        return {
          id: game.id,
          image: game.background_image,
          name: game.name,
          platforms: game.platforms.map((p) => p.platform.name),
          released: game.released,
          rating: game.rating,
          genres: game.genres.map((g) => g.name),
        };
      });
      games = games.concat(apiAllVideogames);
    } else {
      games = await Videogame.findAll({
        where: {
          name: {
            [Op.iLike]: `%${searchName}%`,
          },
        },
      });

      const videogamesApiData = await axios.get(API);
      const apiAllVideogames = videogamesApiData.data.results
        .filter((game) =>
          game.name.toLowerCase().includes(searchName.toLowerCase())
        )
        .map((game) => {
          return {
            id: game.id,
            image: game.background_image,
            name: game.name,
            platforms: game.platforms.map((p) => p.platform.name),
            released: game.released,
            rating: game.rating,
            genres: game.genres.map((g) => g.name),
          };
        });

      games = games.concat(apiAllVideogames);
    }

    res.status(200).send(games);
  } catch (error) {
    res.status(500).send("Error al buscar los juegos");
  }
});

//  try {
//    const videogamesApiData = await axios.get(API);

//    const apiAllVideogames = videogamesApiData.data.results.map((game) => {
//      return {
//        id: game.id,
//        image: game.background_image,
//        name: game.name,
//        description: game.description,
//        platforms: game.platforms.map((p) => p.platform.name),
//        released: game.released,
//        rating: game.rating,
//        genres: game.genres.map((g) => g.name),
//      };
//    });
//    const allVideogames = await Videogame.findAll();
//    const response = [...apiAllVideogames, ...allVideogames];
//    res.status(201).send(response);
//  } catch (error) {
//    res.status(400).send(error.message);
//  }
videogameRoute.get("/:idVideogame", async (req, res) => {
  const { idVideogame } = req.params;
  try {
    if (idVideogame.length > 10) {
      const gameByPk = await Videogame.findOne({
        where: { id: idVideogame },
        include: Genre,
      });
      res.status(200).send(gameByPk);
    } else {
      const response = await axios
        .get(`https://api.rawg.io/api/games/${idVideogame}?key=${API_KEY}`)
        .then((r) => {
          const data = r.data;
          const gameId = data.id;
          const gameImg = data.background_image;
          const gameName = data.name;
          const gameDescription = data.description;
          const gamePlatforms = data.platforms.map((p) => p.platform.name);
          const gameReleased = data.released;
          const gameRating = data.rating;
          const gameGenres = data.genres.map((g) => g.name);
          const gameData = {
            id: gameId,
            image: gameImg,
            name: gameName,
            description: gameDescription,
            platforms: gamePlatforms,
            released: gameReleased,
            rating: gameRating,
            genres: gameGenres,
          };
          res.status(200).send(gameData);
        })
        .catch((error) => {
          res.status(400).send("Juego no encontrado");
        });
    }
  } catch (error) {
    res.status(500).send("Error al buscar el usuario");
  }
});
videogameRoute.get("/", async (req, res) => {
  //Esta ruta debe obtener los primeros 15 videojuegos que se encuentren con la palabra recibida por query.
  // Debe poder buscarlo independientemente de mayúsculas o minúsculas.
  // Si no existe el videojuego, debe mostrar un mensaje adecuado.
  // Debe buscar tanto los de la API como los de la base de datos.
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).send(`no encontrado`);
    } else {
      const game = await Videogame.findAll({
        where: { name: { [Op.startsWith]: name } },
      });
      res.status(201).send(game);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

videogameRoute.post("/", async (req, res) => {
  //Esta ruta recibirá todos los datos necesarios para crear un videojuego y relacionarlo con sus géneros solicitados.
  try {
    const { name, platforms, description, released, rating, genreID } =
      req.body;
    const newGame = {
      name,
      platforms,
      description,
      released,
      rating,
    };
    Videogame.create(newGame).then((game) => {
      return game.addGenre(genreID);
    });
    res.status(201).send(`${name} creado con exito`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = videogameRoute;

// const { idVideogame } = req.params;
//   try {
//     if (idVideogame.length > 10) {
//       const gameByPk = await Videogame.findByPk(id, { include: Genre });
//       return gameByPk;
//     }
//     const apiById = await axios.get(
//       `https://api.rawg.io/api/games/${idVideogame}?key=${API_KEY}`
//     );
//     let response = [...apiById.data];
//     res.status(200).send(response);
//   } catch (error) {
//     res.status(400).send("Error");
//   }
// try {
//   const gameByPk = await Videogame.findOne({
//     where: { id: idVideogame },
//     include: Genre,
//   });
//   if (gameByPk) {
//     res.send(gameByPk);
//   } else {
//     const apiById = `https://api.rawg.io/api/games/${idVideogame}?key=${API_KEY}`;
//     const response = await axios.get(apiById);
//     const game = response.data;

//     if (game) {
//       res.status(200).send(game);
//     } else {
//       res.status(400).send("juego no encontrado");
//     }
//   }
// } catch (error) {
//   res.status(400).send("Error al buscar el usuario");
// }
// videogameRoute.get("/:idVideogame", async (req, res) => {
//   try {
//     const { idVideogame } = req.params;
//     const source = isNaN(idVideogame) ? "bdd" : "api";
//     const infoDetail =
//       source === "api"
//         ? (
//             await axios.get(
//               `https://api.rawg.io/api/games/${idVideogame}?key=${API_KEY}`
//             )
//           ).data
//         : await Videogame.findByPk(idVideogame, { include: Genre });

//     res.status(200).send(infoDetail);
//   } catch (error) {
//     res.status(200).send(error.message);
//   }
// });
// videogameRoute.get("/", async (req, res) => {
//   //Esta ruta debe obtener los primeros 15 videojuegos que se encuentren con la palabra recibida por query.
//   // Debe poder buscarlo independientemente de mayúsculas o minúsculas.
//   // Si no existe el videojuego, debe mostrar un mensaje adecuado.
//   // Debe buscar tanto los de la API como los de la base de datos.
//   try {
//     const { name } = req.query;

//     if (name) {
//       const game = await Videogame.findAll({
//         where: { name: { [Op.startsWith]: name } },
//       });
//       res.status(201).send(game);
//     } else {
//       res.status(400).send(`no encontrado`);
//     }
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// });
