import { DisplayPane } from './displayPane'
import { version as appVersion } from '../package.json' //read version from json
import { contextBridge, ipcRenderer } from 'electron';
import { IO } from './io';
import { TenorPane } from './tenorPane';

const io: IO = new IO()
const display: DisplayPane = new DisplayPane(io);
const search: TenorPane = new TenorPane();

//run on load
window.addEventListener('DOMContentLoaded', () => {
    versionInjection()
    replaceText('library-location', io.config.library)
    updateGifs()
})
//replace text of a given element
function replaceText(selector: string, text :string) {
    const element = document.getElementById(selector)
    if(element) element.innerHTML = text
}
//do specific text replaces for the about popup
function versionInjection() {
    for(const version of ['chrome', 'node', 'electron']) {
        replaceText(`${version}-version`, process.versions[version])
    }

    replaceText('gifhaven-version', appVersion)
}
//expose methods to render.js
contextBridge.exposeInMainWorld('api', {
    //add a new gif from a file
    upload: () => {
        const files: string[] = ipcRenderer.sendSync('select-file')
        if(files == undefined) return;
        const gif = io.importGif(files[0])
        display.add(gif)
        updateGifs()
    },
    //change the location of your library
    changeLibraryLocation: () => {
        io.changeLibraryLocation()
    },
    //add a new gif from a drag and drop
    import: (loc) => {
        const gif = io.importGif(loc);
        display.add(gif)
        updateGifs()
    },
    search: () => {
        updateGifs()
    },
    onlineSearch: () => {
        const text = (document.getElementById('online-search') as HTMLInputElement).value
        search.drawTenor(text)
    }
})
const updateGifs = () => {
    //handle search
    const text = (document.getElementById('search') as HTMLInputElement).value
    if(text == '') display.draw()
    display.draw(new RegExp(text))

    //handle drag and drop
    attachGifDrags()
}
const attachGifDrags = () => {
    //attach file drags
    const gifs = document.getElementsByClassName('gif')
    for(var i = 0; i < gifs.length; i++) {
        const path = gifs[i].getAttribute('data-path');
        (gifs[i] as any).ondragstart = (event) => { //todo cast as any is bad
            event.preventDefault()
            ipcRenderer.send('ondragstart', path)
        }
    }
}