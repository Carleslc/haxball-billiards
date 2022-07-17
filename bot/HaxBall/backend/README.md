# HaxBilliards API

[![Buildable](https://assets.buildable.dev/buildable-logos/powered-by-buildable.svg)](https://buildable.dev)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/carleslc)

Backend is created and hosted with the [Buildable](https://www.buildable.dev/) service.

Database is a NoSQL Database hosted in [Mongo Atlas](https://www.mongodb.com/atlas/database).

## Environment Variables

You need to create in your host service the following environment variables:

- `MONGODB_CONNECTION_KEY` the connection key to your database.
- `API_SECRET` your API secret in `../.env` (you can generate it with your own strong password generator tool or generate it [here](https://www.grc.com/passwords.htm)).
- `BASE_ELO` the starting value for the ELO score. Must be the same as in the `../src/settings.js` file `BASE_ELO` constant (`500` by default).

## API

### Authorization

In order to call the following endpoints you need to add these headers to the requests:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer $API_SECRET"
}
```

`$API_SECRET` is your generated API secret.

If the request is successful it returns `200 OK` with a `data` key in the body with the requested data.

If the request is not successful it returns an error status with an `error` key in the body with details of the error.

If the authorization header is not set or the API secret does not match then a `401 Unauthorized` error will be returned.

### Get player

Get a single player statistics from players collection.

#### Request

**`GET`** `https://api.buildable.dev/flow/v1/call/live/get-player-005eb6db18/PLAYER_AUTH`

Replace the API URL with your own backend URL.

Replace `PLAYER_AUTH` with the player public auth.

Example: `https://api.buildable.dev/flow/v1/call/live/get-player-005eb6db18/vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU`

#### Response

<details>
  <summary><code>200 OK</code></summary>

  Successful response.
  
  ```json
  {
    "data": {
      "_id": "vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU",
      "balls": 66,
      "blackBalls": 5,
      "createdAt": 1657237234024,
      "elo": 500,
      "fouls": 12,
      "games": 17,
      "gamesAbandoned": 1,
      "gamesFinished": 10,
      "misses": 5,
      "name": "kslar",
      "score": 170,
      "shots": 264,
      "timePlayed": 15688,
      "updatedAt": 1657345021073,
      "whiteBalls": 14,
      "wins": 13,
      "winsFinished": 7
    }
  }
  ```
</details>

<details>
  <summary><code>400 Bad Request</code></summary>

  If `PLAYER_AUTH` is not provided.

  ```json
  {
    "error": "/:auth parameter required"
  }
  ```
</details>

### Update players statistics

Create and increment statistics for several players.

#### Request

**`POST`** `https://api.buildable.dev/flow/v1/call/live/add-players-statistics-5315a377f8/`

**Body**

Either an object with `PLAYER_AUTH` keys and some numeric statistic values to increment:

<details>
  <summary>Example</summary>

  ```json
  {
    "PLAYER_AUTH 1": {
      "balls": ...,
      "blackBalls": ...,
      "elo": ...,
      "fouls": ...,
      "games": ...,
      "gamesAbandoned": ...,
      "gamesFinished": ...,
      "misses": ...,
      "score": ...,
      "shots": ...,
      "timePlayed": ...,
      "whiteBalls": ...,
      "wins": ...,
      "winsFinished": ...
    },
    "PLAYER_AUTH 2": {
      "balls": ...,
      "blackBalls": ...,
      "elo": ...,
      "fouls": ...,
      "games": ...,
      "gamesAbandoned": ...,
      "gamesFinished": ...,
      "misses": ...,
      "score": ...,
      "shots": ...,
      "timePlayed": ...,
      "whiteBalls": ...,
      "wins": ...,
      "winsFinished": ...
    },
    ...
  }
  ```
</details>

Or an object with `inc` key mapping to `PLAYER_AUTH` keys and statistics values to increment, and `set` key mapping to `PLAYER_AUTH` keys and user fields to set:

<details>
  <summary>Example with <code>inc</code> and <code>set</code></summary>

  ```json
  {
    "set": {
      "vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU": {
        "name": "kslar"
      },
      "WpeZMpUIEIbY3zOWwIfYXeG1_KdwDtEBBypHz-t_10I": {
        "name": "**** ****"
      },
      "anv8dlRES-lG0V3nHBys4r65JoOzq51c0hQ2826CNQ8": {
        "name": "******"
      },
      "JRYaXrqMerNS3m6bhfX2IvzWE1_YG20oIyV4qsdCpYY": {
        "name": "**** ***"
      }
    },
    "inc": {
      "vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU": {
        "shots": 21,
        "misses": 2,
        "fouls": 4,
        "games": 1,
        "gamesAbandoned": 0,
        "gamesFinished": 1,
        "wins": 0,
        "winsFinished": 0,
        "balls": 4,
        "whiteBalls": 1,
        "blackBalls": 0,
        "score": 5,
        "elo": 0,
        "timePlayed": 1275
      },
      "WpeZMpUIEIbY3zOWwIfYXeG1_KdwDtEBBypHz-t_10I": {
        "shots": 26,
        "misses": 2,
        "fouls": 1,
        "games": 1,
        "gamesAbandoned": 0,
        "gamesFinished": 1,
        "wins": 1,
        "winsFinished": 1,
        "balls": 6,
        "whiteBalls": 3,
        "blackBalls": 0,
        "score": 15,
        "elo": 0,
        "timePlayed": 1276
      },
      "anv8dlRES-lG0V3nHBys4r65JoOzq51c0hQ2826CNQ8": {
        "shots": 1,
        "misses": 1,
        "fouls": 0,
        "games": 1,
        "gamesAbandoned": 0,
        "gamesFinished": 1,
        "wins": 0,
        "winsFinished": 0,
        "balls": 0,
        "whiteBalls": 0,
        "blackBalls": 0,
        "score": 5,
        "elo": 0,
        "timePlayed": 76
      },
      "JRYaXrqMerNS3m6bhfX2IvzWE1_YG20oIyV4qsdCpYY": {
        "shots": 1,
        "misses": 0,
        "fouls": 0,
        "games": 1,
        "gamesAbandoned": 0,
        "gamesFinished": 1,
        "wins": 1,
        "winsFinished": 1,
        "balls": 2,
        "whiteBalls": 0,
        "blackBalls": 1,
        "score": 14,
        "elo": 0,
        "timePlayed": 68
      }
    }
  }
  ```
</details>

#### Response

<details>
  <summary><code>200 OK</code></summary>

  Successful response.

  `inserted` indicates if the player has been created with this request.

  `updated` indicates if the player already existed and has been updated with this request.

  ```json
  {
    "data": {
      "vI7tm0KUTB-rwz5nPorf47_ZTUarz8kX4EMC-a0RmbU": {
        "inserted": false,
        "updated": true,
        "player": {
          "balls": 96,
          "blackBalls": 7,
          "createdAt": 1657237234024,
          "elo": 500,
          "fouls": 24,
          "games": 25,
          "gamesAbandoned": 1,
          "gamesFinished": 15,
          "misses": 16,
          "name": "kslar",
          "score": 239,
          "shots": 386,
          "timePlayed": 22758,
          "updatedAt": 1657420974048,
          "whiteBalls": 16,
          "wins": 18,
          "winsFinished": 9
        }
      },
      "WpeZMpUIEIbY3zOWwIfYXeG1_KdwDtEBBypHz-t_10I": {
        "inserted": false,
        "updated": true,
        "player": {
          "balls": 14,
          "blackBalls": 1,
          "createdAt": 1657333362782,
          "elo": 500,
          "fouls": 8,
          "games": 5,
          "gamesAbandoned": 0,
          "gamesFinished": 4,
          "misses": 12,
          "name": "**** ****",
          "score": 52,
          "shots": 84,
          "timePlayed": 5053,
          "updatedAt": 1657420974048,
          "whiteBalls": 7,
          "wins": 5,
          "winsFinished": 4
        }
      },
      "anv8dlRES-lG0V3nHBys4r65JoOzq51c0hQ2826CNQ8": {
        "inserted": false,
        "updated": true,
        "player": {
          "balls": 11,
          "blackBalls": 0,
          "createdAt": 1657239464043,
          "elo": 500,
          "fouls": 1,
          "games": 4,
          "gamesAbandoned": 0,
          "gamesFinished": 4,
          "misses": 2,
          "name": "******",
          "score": 40,
          "shots": 42,
          "timePlayed": 2460,
          "updatedAt": 1657420974048,
          "whiteBalls": 1,
          "wins": 2,
          "winsFinished": 2
        }
      },
      "JRYaXrqMerNS3m6bhfX2IvzWE1_YG20oIyV4qsdCpYY": {
        "inserted": false,
        "updated": true,
        "player": {
          "balls": 12,
          "blackBalls": 2,
          "createdAt": 1657247182057,
          "elo": 500,
          "fouls": 4,
          "games": 5,
          "gamesAbandoned": 2,
          "gamesFinished": 3,
          "misses": 2,
          "name": "**** ***",
          "score": 39,
          "shots": 48,
          "timePlayed": 3048,
          "updatedAt": 1657420974048,
          "whiteBalls": 1,
          "wins": 3,
          "winsFinished": 3
        }
      }
    }
  }
  ```
</details>

<details>
  <summary><code>400 Bad Request</code></summary>

  When body is not the required type.

  ```json
  {
    "error": "invalid body, it must be an object mapping auth keys to statistic values: { auth: { stats fields } }"
  }
  ```
</details>

<details>
  <summary><code>422 Unprocessable Entity</code></summary>

  When some error occurs while processing the request.

  ```json
  {
    "error": "Cannot set default ELO for player PLAYER_AUTH"
  }
  ```
</details>
