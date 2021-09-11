const baseUrl = "https://servercpa111.herokuapp.com/";

let timer =17;
let timerparagraph = 30;
let timeShowingPopUp = 1;
let seconds = 1;
// let timeOut;
// const ads = document.querySelector(".our-ads");
const ads = document.createElement( "div" );
ads.style.position = "absolute";
ads.style.left = "0";
ads.style.top = "0";
ads.style.width = "100%";
ads.style.height = "100%";
ads.style.zIndex = "2000";
// const imgHolder = document.querySelector(".ads-imgHolder");
const imgHolder = document.createElement( "div" );

imgHolder.style.justifyContent = "center";
imgHolder.style.alignItems = "center";
imgHolder.style.width = "100%";
imgHolder.style.height = "100%";
imgHolder.style.backgroundColor = "rgba(19, 19, 20, 0.767)";
imgHolder.style.display = "none";

const imgAds = document.createElement( "img" );
imgAds.style.display = "inline-block";
imgAds.style.width = "80%";
imgAds.style.height = "auto";
// imgAds.style.height = "80%";
imgAds.style.objectFit = "cover";
imgAds.style.cursor = "pointer";
imgAds.classList.add( "img-ads" );
imgAds.setAttribute( "loading", "lazy" );
imgAds.setAttribute( "src", `${ baseUrl }cpa_monitize/img_ads` );
imgHolder.appendChild( imgAds );
ads.appendChild( imgHolder );

////BTN///
const btn = document.createElement( "button" );
btn.style.padding = "1.2rem 2.5rem";
btn.style.position = "absolute";
btn.style.bottom = "3rem";
btn.style.right = "2rem";

btn.style.outline = "1.5px solid #fff";
btn.style.background = "#fff";
btn.style.border = "none";
// btn.style.color = "#fff";
btn.style.boxShadow = "#333 0px 0px 15px ";
btn.onmouseover = function ( e ) {
  console.log( e )
  e.target.style.background = "#333";
  e.target.style.color = "#fff";
}
btn.classList.add( "btnClose" )
btn.onmouseleave = function ( e ) {
  console.log( e )
  e.target.style.background = "#fff";
  e.target.style.color = "#333";
}


imgHolder.appendChild( btn );
// End Button

////Paragraph ///
const p = document.createElement( "p" );
// p.style.padding = "1.2rem 2.5rem";
p.style.position = "absolute";
p.style.bottom = "1rem";
p.style.right = "2rem";
p.style.fontFamily = "Franklin Gothic Medium, sans-serif"

// p.style.outline = "1.5px solid #fff";
// p.style.background = "#fff";
p.style.border = "none";
// p.style.color = "#fff";
// p.style.boxShadow = "#333 0px 0px 15px ";
p.onmouseover = function ( e ) {
  console.log( e )
  // e.target.style.background = "#333";
  e.target.style.color = "#fff";
}
p.classList.add( "pClose" )
p.onmouseleave = function ( e ) {
  console.log( e )
  // e.target.style.background = "#fff";
  e.target.style.color = "#fefefe";
}



imgHolder.appendChild( p );
// End Paragraph

document.body.appendChild( ads );
// let count = 1;
let Globlelink = "";
let isPublick = false;
let byClicking = false;
const crossHeader = "https://accessanywheremahdi.herokuapp.com/";
let showPopUp = false;
let isOpened = true;
/*Style********/
// function css(obj) {
//   return obj.style;
// }
// imgHolder.style.backgroudColor = "#fefefe";

/*Style********/

function getData() {
  // console.log( "data" )
  const Url = `${ baseUrl }cpa_monitize/`;
  fetch( crossHeader + Url )
    .then( data => {
      const res = data.json();
      return res;
    } )
    .then( data => {
      LogicAds( data );
    } );
}
let intervalFn = setInterval( () => {
  checkDataAds();
}, 3000 );

let startTimeOut = setTimeout( () => {
  checkDataAds();
}, 1000 );

function checkDataAds() {
  getData();
}

// **********
function LogicAds( data ) {
  // console.log( data )
  clearTimeout( startTimeOut );
  seconds = data.timePushAds;
  timeShowingPopUp = data.timeShowingPopUp;
  Globlelink = data.link;
  isPublick = data.isPublic;
  byClicking = data.byClicking;
  showPopUp = data.showPopUp;
  showPopUpFn();

  // img.src = "https://monitizegame.herokuapp.com/cpa_monitize/img_ads";

  //user not clicked and by clicking is disabled
  if ( !data.byClicking && data.isPublic && isOpened ) {
    isOpened = false;
    TimerFn()
    imgHolder.style.display = "flex";
    setTimeout( () => {
      // window.location.href = data.link;
      // console.log( "automatic" )
      imgHolder.style.display = "none";
      window.open( data.link, "_blank" )
      // count++;

    }, seconds * 1000 );

    return;
  }

}
function navigate( link ) {

  if ( isPublick && byClicking ) {
    window.location.href = link;

  }
}

imgHolder.addEventListener( "click", popUpFn );

function popUpFn( e ) {
  // console.log( count );
  if ( e.target.classList.contains( "img-ads" ) ) {
    navigate( Globlelink );
  } else if ( e.target.classList.contains( "btnClose" ) ) {
    imgHolder.style.display = "none";
    ads.removeEventListener( "click", popUpFn );
    clearInterval( intervalFn );
    clearTimeout( timeOut )
  }

}
function showPopUpFn() {
  if ( showPopUp && isPublick && isOpened && timerparagraph > 0 && timer > 0 ) {
    timeOut = setTimeout( () => {
      imgHolder.style.display = "flex";

    }, timeShowingPopUp * 1000 );
  }

}

//////////////Function For Timer button
function TimerFn() {
  if ( timer >= 0 ) {
    const timeOut = setTimeout( () => {
      if ( timer > 0 ) {
        timer--;
        TimerFn();
        btn.innerHTML = "Please wait " + timer + "... "
        // console.log( timer )
        btn.disabled = true;
        btn.style.opacity = ".8";
        btn.style.cursor = "default";
      } else {
        clearTimeout( timeOut )
        btn.innerHTML = "Skip Ads >>"
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
      }
    }, 1000 )
  }
}
TimerFn()

//////////////Function For Timer button
function timerparagraphFn() {

  if ( timerparagraph >= 0 ) {
    const timeOut = setTimeout( () => {
      if ( timerparagraph > 0 ) {
        timerparagraph--;
        timerparagraphFn();
        p.innerHTML = "Ads will Skipped Automatically After " + timerparagraph + "s"
        // p.innerHTML = "please Wait " + timerparagraph + "... "
        // console.log( timerparagraph )
        p.disabled = true;
        p.style.opacity = ".5";
        p.style.cursor = "default";
      } else {

        imgHolder.style.display = "none";
        ads.removeEventListener( "click", popUpFn );
        clearInterval( intervalFn );
        clearTimeout( timeOut )

      }
    }, 1000 )
  }
}
// timerparagraphFn()

///*****in c2runtime.js
// Copie this in Top Of c2runtime.js *****
// let initCountLayout = 3;
// let CountLayout = initCountLayout;


// // Copie in gotoLayout function *****

// if ( CountLayout > 0 ) {
//   CountLayout--;
//   // console.log( "no Ads Layout" );
// } else {
//   CountLayout = initCountLayout;
//   // console.log( "GO To Ads from Layout" );
//   showPopUpFn();
// }