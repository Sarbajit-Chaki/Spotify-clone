let currSong = new Audio()
let songs
let currF

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums(){
    let a = await fetch("/assets/songs/")
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response

    let array = Array.from(div.getElementsByTagName("a"))
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("assets/songs") && !e.href.includes(".htaccess")){
            // console.log(e.href.split("/").slice(-2)[0]) Getting folders
            let folder = e.href.split("/").slice(-2)[0]
            
            //Get the meta data from the folder
            let a = await fetch(`/assets/songs/${folder}/info.json`)
            let response = await a.json()

            let cards = document.querySelector(".cards")
            cards.innerHTML = cards.innerHTML + `
            <div data-file="${folder}" class="card rounded">
                <div class="play">
                    <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="-2 -2 28 28" class="Svg-sc-ytk21e-0 bneLcE" width="62px">
                        <circle cx="12" cy="12" r="11" fill="#1fdf64" />
                        <path d="M9 6 17 12 9 18z" fill="black"></path>
                    </svg>                                                                                                                                                  
                </div>

                <img class="rounded" src="assets/songs/${folder}/cover.jpg" alt="">
                <h4>${response.title}</h4>
                <h5>${response.desc}</h5>
            </div>`
        }
    }

    //Add event listener to playlist to show all the songs

    document.querySelectorAll(".card").forEach(e=>{
        e.addEventListener("click",async(item)=>{
            await getSongs(`${item.currentTarget.dataset.file}`)
            playMusic(songs[0])
        })
    })
}

async function getSongs(folder){
    currF = folder
    let a = await fetch(`/assets/songs/${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}/`)[1])
        }
    }

    //Show all the songs in the playlist

    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
        <li>
        <img src="assets/images/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20"," ")}</div>
            
        </div>
        <div class="playnow">
            <img src="assets/images/play.svg" alt="play">
        </div>
        </li>`
    }

    //Attach event listener to each songs

    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    });
}

const playMusic = (track,pause = false)=>{
    // let audio = new Audio("/assets/songs/" + track)
    currSong.src = `assets/songs/${currF}/` + track

    if(!pause){
        currSong.play()
        play.src = "assets/images/pause.svg"
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00/00:00"
}

async function main(){
    //Get all the playist shown
    displayAlbums()

    //Get the list of all the songs

    await getSongs("F1")   
    playMusic(songs[0],true)

    
    
    

    //Attach an event listener to play

    play.addEventListener("click",()=>{  
        if(currSong.paused){
            currSong.play()
            play.src = "assets/images/pause.svg"
        }
        else{
            currSong.pause()
            play.src = "assets/images/play.svg"
        }
    })

    //Attach an event listener to previous
    prev.addEventListener("click",()=>{
        let index = songs.indexOf(currSong.src.split(`/${currF}/`)[1])
        if(index > 0){
            playMusic(songs[index-1])
        }
    })


    //Attach an event listener to next

    next.addEventListener("click",()=>{
        let index = songs.indexOf(currSong.src.split(`/${currF}/`)[1])
        if(index < songs.length-1){
            playMusic(songs[index+1])
        }
    })
    
    //Listen for time update event
    currSong.addEventListener("timeupdate",()=>{
            //For time duration
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`
        
            //For seekbar change by time
        document.querySelector(".circle").style.left = (currSong.currentTime/currSong.duration) * 100 + "%";
    })


    //Add an event listener to the seekbar

    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = ((currSong.duration) * percent) / 100
    })

    //Add an event listener to the volume 

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currSong.volume = e.target.value/100
        if(currSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    //Add event listener to playlist to show all the songs

    
    //Add an event listener to mute songs
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
           e.target.src = e.target.src.replace("volume.svg","mute.svg") 
            currSong.volume = 0
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        }
        else{
           e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currSong.volume = 10/100
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10
        }
    })

    //Add an event listener for hamburger feature
    document.querySelector(".hamburger").addEventListener("click",(e)=>{
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listener for hamburger close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })
}
      
main()