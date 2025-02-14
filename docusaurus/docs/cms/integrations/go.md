---
title: Go
displayed_sidebar: cmsSidebar
description: Integrate Strapi with Go.
---

import RemovingIntegrations from '/docs/snippets/integration-guides-soon-removed.md'

# Getting Started with GO

<RemovingIntegrations />

This integration guide follows the [Quick Start Guide](https://docs.strapi.io/cms/quick-start). You should be able to consume the API by browsing the URL [http://localhost:1337/api/restaurants](http://localhost:1337/api/restaurants).

If you haven't gone through the Quick Start guide, the way you request a Strapi API with [GO](https://golang.org/) remains the same except that you do not fetch the same content.

## Create a Go file

Be sure to have [Go installed](https://golang.org/doc/install) on your computer.

```bash
touch strapi.go
```

Go has built-in packages to make HTTP Requests like GET, POST, PUT, and DELETE.
We will use the "net/http" package along with other packages.


## GET Request your collection type

Execute a `GET` request on the `restaurant` collection type in order to fetch all your restaurants.

Be sure that you activated the `find` permission for the `restaurant` collection type.

<ApiCall noSideBySide>
<Request title="Example GET request">

```go
response, error := http.Get("http://localhost:1337/api/restaurants")
```

</Request>

<Response title="Example response">

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

</Response>
</ApiCall>

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
	res, error := http.Get("http://localhost:1337/api/restaurants")
	if error != nil {
		fmt.Printf("The HTTP request failed with error %s\n", error)
	} else {
		data, _ := ioutil.ReadAll(res.Body)
		fmt.Println(string(data))
	}
}
```
## POST Request your collection type

Execute a `POST` request on the `restaurant` collection type in order to create a restaurant.

Be sure that you activated the `create` permission for the `restaurant` collection type and the `find` permission for the `category` Collection type.

<ApiCall noSideBySide>
<Request title="Example POST request">

```go
postRest, _ := json.Marshal(map[string]string{
  "name":  "Nwanyi Igbo",
  "description": "This is a very nice place to eat native soup",
})
responseBody := bytes.NewBuffer(postRest)
resp, error := http.Post("http://localhost:1337/api/restaurants", "application/json", responseBody)
```

</Request>

<Response title="Example response">

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

</Response>
</ApiCall>

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
  resp, error := http.Get("http://localhost:1337/api/restaurants")
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
  resp, error := http.Post("http://localhost:1337/api/restaurants", "application/json", responseBody)
  //Handle Error
  if error != nil {
    log.Fatalf("An Error Occurred %v", error)
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

## PUT Request your collection type

Execute a `PUT` request on the `restaurant` collection type in order to update the category of a restaurant.

Be sure that you activated the `update` permission for the `restaurant` collection type.
PUT Request is sligtly different as we need to target the particular thing we want update. We do this by first making a request to http://localhost:1337/api/restaurants/1 and then update what we want to update. In this example, we are going to update  "Biscotte Restaurant" to "Restaurant Home".

<ApiCall noSideBySide>
<Request title="Example PUT request">

```go
putRest, _ := json.Marshal(map[string]string {
  "name": "Restaurant Homes",    
})
client := &http.Client{}
url := "http://localhost:1337/api/restaurants/1"
req, error := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(putRest))
req.Header.Set("Content-Type", "application/json")
```

</Request>

<Response title="Example response">

```json
{
  "id": 1,
  "name": "Restaurant Homes",
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

</Response>
</ApiCall>


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
	resp, error := http.Get("http://localhost:1337/api/restaurants")
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
	resp, error := http.Post("http://localhost:1337/api/restaurants", "application/json", responseBody)
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
		"name": "Restaurant Homes",
	})
	client := &http.Client{}
	url := "http://localhost:1337/api/restaurants/1"
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
