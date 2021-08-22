package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"
)

type FileInfo struct {
	Name string
	Size int64
	Mode os.FileMode
	ModTime time.Time
	IsDir bool
	Path string
	Thumbnail string
}

type PathQuery struct {
	Name string
}
var fileIgnore []string
var imageExtensions []string


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

func include(array []string, str string) bool {
	for _, a := range array {
		if strings.Contains(str, a) {
			return true
		}
	}
	return false
}

func getPath(w http.ResponseWriter, r *http.Request) {
		// decode the query path
		var pathQuery PathQuery
		decodedValue, err := url.QueryUnescape(r.URL.RawQuery)
		queryParams := strings.Split(decodedValue, "&")
		sort.Strings(queryParams)
		for _, queryParam :=range queryParams {
			params := strings.Split(queryParam, "=")
			if strings.ToLower(params[0]) == "name" {
				pathQuery.Name = params[1]
			}
		}

		dir := "/mp3"
		if pathQuery.Name != "" {
			dir += "/" + pathQuery.Name
		}
		files, err := ioutil.ReadDir(dir)
 
		var fileInfoList []FileInfo
    for _, f := range files {
			if include(fileIgnore, f.Name()) {
				continue
			}
			// get catalog thumbnail
			var thumbnail string
			if strings.Contains(f.Name(), "@") {
				subDir := "/mp3" + pathQuery.Name + "/" + f.Name()
				subFiles, _ := ioutil.ReadDir(subDir)
					for _, subF := range subFiles {
						if include(imageExtensions, subF.Name()){
							thumbnail = pathQuery.Name + "/" + f.Name() + "/" + subF.Name()
							continue
						}
					}

			}
			fileInfo := FileInfo{Name: f.Name(), Size: f.Size(), Mode: f.Mode(), ModTime: f.ModTime(), IsDir: f.IsDir(), Path: pathQuery.Name + "/" + f.Name(), Thumbnail: thumbnail}
			fileInfoList = append(fileInfoList, fileInfo)
    }

    b, err := json.Marshal(fileInfoList)
    if err != nil {
        log.Fatal(err)
    }
		setHeader(w, b, err)
}

func main() {
	fileIgnore = []string{".DS_Store", "._"}
	imageExtensions = []string{".png", ".jpg", ".jpeg"}
	http.HandleFunc("/api/authorize", authorize)
	http.HandleFunc("/api/path", getPath)


	log.Fatal(http.ListenAndServe(":80", nil))
}
