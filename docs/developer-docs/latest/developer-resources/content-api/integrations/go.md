# Getting Started with Ruby

This integration guide is following the [Getting started guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have completed [Step 9](/developer-docs/latest/getting-started/quick-start.md#_9-consume-the-content-type-s-api) and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

If you haven't gone through the getting started guide, the way you request a Strapi API with [GO](https://golang.org/) remains the same except that you will not fetch the same content.


### Create a Go file

Be sure to have Go installed on your computer

```bash
touch strapi.go
```

Go has inbuilt modules needed to make a GET, POST PUT, DELETE requests
We will use this along with other modules


### GET Request your collection type

Execute a `GET` request on the `restaurant` Collection Type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` Collection Type.


_Request_

```go
 response, error := http.Get("http://localhost:1337/restaurants")
```

_Response_

```json
[
  {
    "id": 1,
    "name": "Biscotte Restaurant",
    "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
   
    "created_at": "2021-03-31T11:37:16.964Z",
    "updated_at": "2021-03-31T11:37:16.975Z",
    "categories": [
      {
        "id": 1,
        "name": "French Food",
        "created_by": 1,
        "updated_by": 1,
        "created_at": "2021-03-31T11:36:23.164Z",
        "updated_at": "2021-03-31T11:36:23.172Z"
      },

      {
        "id": 2,
        "name": "Brunch ",
        "published_at": "2021-03-07T10:10:19.608Z",
        "created_at": "2021-03-07T10:10:14.477Z",
        "updated_at": "2021-03-07T10:10:19.649Z"
}
    ]
  }
]
```

### Example


```go
 package main
import(
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    fmt.Println("Getting data...")
    res, error := http.Get("http://localhost:1337/restaurants")
    if error != nil {
        fmt.Printf("The GET request failed with error %s\n", error)
    } else {
        data, _ := ioutil.ReadAll(res.Body)
        fmt.Println(string(data))
    }

}
```
### POST Request your collection type

Execute a `POST` request on the `restaurant` Collection Type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` Collection Type and the `find` permission for the `category` Collection type.


_Request_

```go
  postRest, _ := json.Marshal(map[string]string{
		  "name":  "Nwanyi Igbo",
		  "description": "This is a very nice place to eat naive soup",
		  })
	   responseBody := bytes.NewBuffer(postRest)
	   resp, error := http.Post("http://localhost:1337/restaurants", "application/json", responseBody)
```

_Response_

```json
{
  "id": 2,
  "name": "Nwanyi Igbo",
  "description": "This is a very nice place to eat naive soup",
  "created_at": "2021-03-04T09:57:11.669Z",
  "updated_at": "2021-04-04T09:57:11.669Z",
  "categories": [  ]
}
```

### Example
```go
package main
import(
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
)
func main() {
	fmt.Println("Posting  data...")
	   postRest, _ := json.Marshal(map[string]string{
		  "name":  "Nwanyi Igbo",
		  "description": "This is a very nice place to eat naive soup", 
	   })
	   responseBody := bytes.NewBuffer(postRest)
	   resp, error := http.Post("http://localhost:1337/restaurants", "application/json", responseBody)
	   if error != nil {
		  log.Fatalf("An Error Occured %v", error)
	   }
	   defer resp.Body.Close()
	   body, error := ioutil.ReadAll(resp.Body)
	   if error != nil {
		  log.Fatalln(error)
	   }
	   fmt.Println(string(body))
    }
```	  