const { Router } = require("express");
const genresRoute = Router();
const { default: axios, all } = require("axios");
const { Genre } = require("../db");
const { API_KEY } = process.env;
const API = `https://api.rawg.io/api/genres?key=${API_KEY}`;

genresRoute.get("/", async (req, res) => {
  try {
    let dataDb = await Genre.findAll();
    if (dataDb.length) return dataDb;
    const genresApiData = await axios.get(API);
    const allGenres = genresApiData.data.results.map((g) => ({
      id: g.id,
      name: g.name,
    }));
    await Genre.bulkCreate(allGenres);
    res.status(200).send(allGenres);
  } catch (error) {
    res.status(400).send(message.error);
  }
});

module.exports = genresRoute;

// return result;

// let resultDb = await Type.findAll();

// if (resultDb.length) return resultDb;

// let result = await fetch(API);
// result = await result.json();
// result = result.results.map((r, i) => ({
//   id: i + 1,
//   name: r.name,
// }));

// await Type.bulkCreate(result);

// return result;
