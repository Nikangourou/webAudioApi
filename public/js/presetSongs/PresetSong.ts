import Song from '../../../songs/interface/Song'
import parse from '../../../src/parse/parse'
import Player from '../../../src/player/Player'
import Game from '../../../src/game/Game'

export default class PresetSong {
  #song: Song

  constructor(song: Song) {
    this.#song = song
  }

  createHTML(): HTMLDivElement {
    const card = document.createElement('div')
    card.classList.add('card')

    const titleContainer = document.createElement('div')
    titleContainer.classList.add('card-title-container')
    card.appendChild(titleContainer)

    const title = document.createElement('h4')
    title.textContent = this.#song.title
    title.classList.add('card-title')
    titleContainer.appendChild(title)

    const contentContainer = document.createElement('div')
    contentContainer.classList.add('card-content-container')
    card.appendChild(contentContainer)

    const author = document.createElement('p')
    author.textContent = this.#song.author
    author.classList.add('card-content')
    contentContainer.appendChild(author)

    const button = document.createElement('button')
    button.textContent = 'Play this song'
    button.classList.add('card-button')
    card.addEventListener('click', () => this.playAction(button, card))
    contentContainer.appendChild(button)

    return card
  }

  async playAction(button: HTMLButtonElement, card: HTMLDivElement) {
    if (!Player.isPlaying) {
      button.textContent = 'Stop'

      const API_URL = 'http://localhost:8001/api'
      // get highscore

      let bestScores = []

      await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((json) => {
          bestScores = json
        })

	
	  const bestScore = bestScores.find((score) => score.title === this.#song.title)
	  
	  if (bestScore) {
		Game.setBetsScore(bestScore.score)
	  }else{
		Game.setBetsScore(0)
	  }

      card.addEventListener('click', () => this.stopAction(button, card), {
        once: true,
      })

      const playerResult = await Player.play(parse(this.#song.tablature))

      if (playerResult.hasFinishedPlaying) {
        button.textContent = 'Play this song'
        card.addEventListener('click', () => this.playAction(button, card), {
          once: true,
        })

        this.endGame()
      }
    }
  }

  stopAction(button: HTMLButtonElement, card: HTMLDivElement) {
    if (Player.isPlaying) {
      Player.stop()

      button.textContent = 'Play this song'

      card.addEventListener('click', () => this.playAction(button, card), {
        once: true,
      })
    }
  }

  endGame() {
    const title = this.#song.title
    const score = Game.getScore()
    Game.resetScore()

    // post score to database
    const data = { title, score }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }

    const API_URL = 'http://localhost:8001/api'
    // set score
    fetch(API_URL, options).then(() => {
      // get highscore
      fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((json) => {
          console.log(json)
        })
    })
  }
}
