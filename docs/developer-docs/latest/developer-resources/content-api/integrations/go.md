# Getting Started with GO

This integration guide is following the [Getting started guide](/developer-docs/latest/getting-started/quick-start.md). We assume that you have completed [Step 8](/developer-docs/latest/getting-started/quick-start.html#_8-publish-the-content) and therefore can consume the API by browsing this [url](http://localhost:1337/restaurants).

If you haven't gone through the getting started guide, the way you request a Strapi API with [GO](https://golang.org/) remains the same except that you will not fetch the same content.


### Create a Go file

Be sure to have Go installed on your computer.

```bash
touch strapi.go
```

Go has inbuilt module/package needed to make HTTP Requests like GET, POST PUT, DELETE.
We will use it("net/http") along with other modules/packages.


### GET Request your collection type

Execute a `GET` request on the `restaurant` Collection Type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` Collection Type.


_Request_

```go
response, error := http.Get("http://localhost:1337/restaurants")
```

_Response_

```json
[{
  "id": 1,
  "name": "Biscotte Restaurant",
  "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
  "created_at": "2021-03-31T11:37:16.964Z",
  "updated_at": "2021-03-31T11:37:16.975Z",
  "categories": [{
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
}]
```

### Example


```go
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	getD()
}

func getD() {
	fmt.Println("Getting data...")
	res, error := http.Get("http://localhost:1337/restaurants")
	if error != nil {
		fmt.Printf("The HTTP request failed with error %s\n", error)
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
  "description": "This is a very nice place to eat native soup",
})
responseBody := bytes.NewBuffer(postRest)
resp, error := http.Post("http://localhost:1337/restaurants", "application/json", responseBody)
```

_Response_

```json
{
  "id": 2,
  "name": "Nwanyi Igbo",
  "description": "This is a very nice place to eat native soup",
  "created_at": "2021-03-04T09:57:11.669Z",
  "updated_at": "2021-04-04T09:57:11.669Z",
  "categories": []
}
```

### Example

```go
package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "io/ioutil"
  "log"
  "net/http"
)

func main() {
  postD()
}

func getD() {
  fmt.Println("Getting data...")
  resp, error := http.Get("http://localhost:1337/restaurants")
  if error != nil {
    fmt.Printf("The HTTP request failed with error %s\n", error)
  } else {
    data, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(data))
  }
}

func postD() {
  fmt.Println("Posting  data...")
  //Encode the data
  postRest, _ := json.Marshal(map[string]string{
    "name":        "Nwanyi Igbo",
    "description": "This is a very nice place to eat native soup",
  })
  responseBody := bytes.NewBuffer(postRest)
  resp, error := http.Post("http://localhost:1337/restaurants", "application/json", responseBody)
  //Handle Error
  if error != nil {
    log.Fatalf("An Error Occured %v", error)
  }
  defer resp.Body.Close()
  //Read the response body
  body, error := ioutil.ReadAll(resp.Body)
  if error != nil {
    log.Fatalln(error)
  }
  fmt.Println(string(body))
}
```	  


### PUT Request your collection type

Execute a `PUT` request on the `restaurant` Collection Type in order to update the category of a restaurant.

Be sure that you activated the `update` permission for the `restaurant` Collection Type.
PUT Request is sligtly different as we need to target the particular thing we want update. We do this by first making a request to http://localhost:1337/restaurants/1 and then update what we want to update. In this example, we are going to update  "Biscotte Restaurant" to "Restaurant Home".


_Request_

```go
putRest, _ := json.Marshal(map[string]string {
  "name": "Resturant Homes",    
})
client := &http.Client{}
url := "http://localhost:1337/restaurants/1"
req, error := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(putRest))
req.Header.Set("Content-Type", "application/json")
```

_Response_

```json
{
  "id": 1,
  "name": "Resturant Homes",
  "description": "Welcome to Biscotte restaurant! Restaurant Biscotte offers a cuisine based on fresh, quality products, often local, organic when possible, and always produced by passionate producers.",
  "published_at": "2021-03-07T10:10:46.949Z",
  "created_at": "2021-03-07T10:08:53.929Z",
  "updated_at": "2021-03-07T14:06:01.567Z",
  "categories": [{
      "id": 1,
      "name": "French Food",
      "published_at": "2021-03-07T10:09:43.232Z",
      "created_at": "2021-03-07T10:09:34.135Z",
      "updated_at": "2021-03-07T10:09:43.280Z"
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
```


### Example

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func main() {
	//getD()
	//postD()
	putD()
}
func getD() {
	fmt.Println("Getting data...")
	resp, error := http.Get("http://localhost:1337/restaurants")
	if error != nil {
		fmt.Printf("The HTTP request failed with error %s\n", error)
	} else {
		data, _ := ioutil.ReadAll(resp.Body)
		fmt.Println(string(data))
	}
}
func postD() {
	fmt.Println("Posting  data...")

	// Encode the data
	postRest, _ := json.Marshal(map[string]string{
		"name":        "Nwanyi Igbo",
		"description": "This is a very nice place to eat native soup",
	})

	responseBody := bytes.NewBuffer(postRest)
	resp, error := http.Post("http://localhost:1337/restaurants", "application/json", responseBody)
	// Handle Error
	if error != nil {
		log.Fatalf("An Error Occured %v", error)
	}
	defer resp.Body.Close()
	// Read the response body
	body, error := ioutil.ReadAll(resp.Body)
	if error != nil {
		log.Fatalln(error)
	}

	fmt.Println(string(body))
}
func putD() {
	putRest, _ := json.Marshal(map[string]string{
		"name": "Resturant Homes",
	})
	client := &http.Client{}
	url := "http://localhost:1337/restaurants/1"
	req, error := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(putRest))
	req.Header.Set("Content-Type", "application/json")
	if error != nil {
		log.Fatal(error)
	}
	resp, error := client.Do(req)
	if error != nil {
		log.Fatal(error)
	}
	defer resp.Body.Close()

	body, error := ioutil.ReadAll(resp.Body)
	if error != nil {
		log.Fatal(error)
	}
	fmt.Println(string(body))
}

```

## Conclusion

Here is how to request your Collection Types in Strapi using Go. When you create a Collection Type or a Single Type you will have a certain number of REST API endpoints available to interact with.

We just used the GET, POST and PUT methods here but you can [get one entry](/developer-docs/latest/developer-resources/content-api/content-api.md#get-an-entry), [get how much entry you have](/developer-docs/latest/developer-resources/content-api/content-api.md#count-entries) and [delete](/developer-docs/latest/developer-resources/content-api/content-api.md#delete-an-entry) an entry too. Learn more about [API Endpoints](/developer-docs/latest/developer-resources/content-api/content-api.md#api-endpoints).
