# Diffraction Demo

These are the scripts needed to run the diffraction demonstration as part of the 
Neutron Trailer as part of the [ORNL Travelling Science Fair](https://orise.orau.gov/ornl-science-fair/).

## Internet Version

If Internet is available, the demo can simple we run by visiting [this page](https://tproffen.github.io/ORNLNeutronTrailer/DiffractionCamera.html). The 
recommended browser is [Google Chrome](https://www.google.com/chrome/browser/desktop/index.html). Press `F11` for full screen mode.

## Local Installation

In cases where Internet access is not available, the demo needs to be run locally. It is possible
to just open `DiffractionCamera.html` in a local browser and all will work. However, 
depending on security setting and the web browser, the camera will not work when the file is loaded 
locally. If no Internet access is available, run a simple webserver by open a command prompt and 
running the command:

```
cd <directory with web pages>
python -m http.server 8080 
```

Now you can access the pages at [localhost:8080](http://localhost:8080/) from your web browser.


