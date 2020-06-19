package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.LoadHTMLFiles("index.tmpl")
	r.StaticFS("/static", http.Dir("static"))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{})
	})

	api := r.Group("/api")
	{
		api.GET("/test", func(c *gin.Context) {
			c.Data(http.StatusOK, "text/plain", []byte("hello world\n"))
		})
	}

	r.Run()
}
