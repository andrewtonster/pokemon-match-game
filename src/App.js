import "./App.css";
import Die from "./Die";
import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

function App() {
  // STATE INITIALIZATION //
  const [dice, setDice] = useState([]);
  const [originalDiceImages, setOriginalDiceImages] = useState([]);
  const [winner, setWinner] = useState(false);

  // Using effect to make an api cal and store the data
  useEffect(() => {
    startNewGame();
  }, []);

  // Using effect to check if there is a winner everytime dice changes
  useEffect(() => {
    if (dice.length > 0) {
      const first_img = dice[0].img;
      const all_held = dice.every((item) => {
        return item.isHeld === true;
      });

      const all_same = dice.every((item) => {
        return item.img === first_img;
      });

      if (all_same && all_held) {
        // Handle the winning condition here
        setWinner((prevWinner) => {
          return !winner;
        });
      }
    }
  }, [dice]);

  // helper funciton, to shuffle the array and return 6 random pokmon
  function shuffleArray(array) {
    let temp = [];
    for (let i = 0; i < 6; i++) {
      let randomIndex = Math.floor(Math.random() * array.length);
      let randomPoke = array[randomIndex];
      temp.push(randomPoke);
    }
    return temp;
  }

  // Function to fetch Pokemon data and images and store in state
  const fetchPokemonData = async () => {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      const results = jsonData.results;

      // Shuffle the results array to randomize the order.
      const selectedPokemon = shuffleArray(results);

      // Use selectedPokemon to fetch individual Pokemon data and images.
      const diceImages = await Promise.all(
        selectedPokemon.map(async (pokemon) => {
          const response = await fetch(pokemon.url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const pokemonData = await response.json();
          return {
            img: pokemonData.sprites.front_default,
          };
        })
      );

      // Store the original set of Pokemon images
      setOriginalDiceImages(diceImages);

      // Set the diceImages array in the state.
      return diceImages;
    } catch (error) {
      console.log(error);
      return []; // Return an empty array in case of an error
    }
  };

  const startNewGame = async () => {
    const diceImages = await fetchPokemonData(); // Wait for the API call to complete
    const randomImages = [];
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * diceImages.length);
      const randomValue = {
        id: nanoid(),
        img: diceImages[randomIndex].img,
        isHeld: false,
      };

      randomImages.push(randomValue);
    }
    setWinner(false);
    setDice(randomImages);
  };

  function holdDice(id) {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
  }

  function generateNewDie() {
    return {
      id: nanoid(),
      img: originalDiceImages[
        Math.floor(Math.random() * originalDiceImages.length)
      ].img,
      isHeld: false,
    };
  }

  function rollDice() {
    if (!winner) {
      setDice((oldDice) =>
        oldDice.map((die) => {
          return die.isHeld ? die : generateNewDie();
        })
      );
    } else {
      setDice(startNewGame());
    }
  }

  const diceElements = dice.map((image) => {
    return (
      <Die
        key={image.id}
        img={image.img}
        isHeld={image.isHeld}
        holdDice={() => holdDice(image.id)}
      />
    );
  });

  return (
    <main className="main">
      <div className="title__container">
        <h1 className="title">Match the pokemon!</h1>
      </div>

      {winner && <Confetti />}
      <div className="body__container">
        <div className="die__container">
          {diceElements}

          <button
            className="roll__btn"
            onClick={winner ? startNewGame : rollDice}
          >
            {winner ? "New Game" : "Roll"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default App;
