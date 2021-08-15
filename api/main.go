// +build ignore

package main

import (
	"io/ioutil"
	"log"
	"net/http"
)

type Profile struct {
	Name string
}

func setHeader(w http.ResponseWriter, data []byte, err error) {
	// js, err := json.Marshal(data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("x-newrelic-app-data", "PxQFVF9UDQYAR1ZTAggFUFMEABFORDQHUjZKA1ZLVVFHDFYPbU5yARBfWA86THlDQDg9KkNFRzo4clldFhQMDlwHShFkZHBeQAxNBHIOXRYWWVsNAxF4UkANJQ5EWEMDJURCWw0UChhVJV0WGhQEHANVCVEBTQNMVQQDUFJPFQIcRlADUwcCXlMAD1FRX1oBBFYaTl5ZWEFWOA==")
	w.Header().Set("x-cache-status", "BYPASS")
	w.Write(data)
}

func authorize(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("./json/authorize.json")
	setHeader(w, data, err)
}

func ignore(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("./json/ignore.json")
	setHeader(w, data, err)
}
func productCount(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("./json/productCount.json")
	setHeader(w, data, err)
}

func main() {
	http.HandleFunc("/api/authorize", authorize)
	http.HandleFunc("/api/ignore", ignore)
	http.HandleFunc("/api/product_count", productCount)

	log.Fatal(http.ListenAndServe(":80", nil))
}
