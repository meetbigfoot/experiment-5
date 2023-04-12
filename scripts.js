let coords = [-118.46, 34]
let history = [
  {
    role: 'system',
    content: `You are a friendly local guide telling me about what is around me and I want you to give short, quick responses to all of my questions.`,
  },
]

const g = document.getElementById.bind(document)
const q = document.querySelectorAll.bind(document)

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0dGJvcm4iLCJhIjoiY2w1Ym0wbHZwMDh3eTNlbnh1aW51cm0ydyJ9.Z5h4Vkk8zqjf6JydrOGXGA'

loadingGif = 'https://res.cloudinary.com/bigfoot-cdn/image/upload/v1681246901/demo/liquid-geometry-loader_yjymcn.gif'

const models = ['turbo', 'gpt4']

const changeModel = () => enrichPosition(coords)

const heyI = async messages => {
  const response = await fetch(`https://us-central1-samantha-374622.cloudfunctions.net/${g('model').value}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })
  return response.text()
}

const tikapi = async query => {
  const response = await fetch('https://us-central1-samantha-374622.cloudfunctions.net/tiktok', {
    method: 'POST',
    body: query,
  })
  return response.text()
}

// ok we are going to do a bunch of things in series

const enrichPosition = c => {
  history.push({
    role: 'user',
    content: `Please tell me the state, city, local area or neighborhood name, and approximate address for these coordinates: ${c}.`,
  })
  heyI(history).then(text => {
    history.push({
      role: 'assistant',
      content: text,
    })
    g('position').textContent = text
    getTimes(c)
    getVenues(c)
  })
}

const getTimes = c => {
  heyI([
    ...history,
    {
      role: 'user',
      content: `Get day of the week and human-friendly and machine-readable start of day and end of day times that make sense when planning activities for today (the year is 2023 and the current time is ${Date.now()}), tomorrow, and this weekend for my current timezone using these coordinates: ${c}.`,
    },
  ]).then(text => {
    // history.push({
    //   role: 'assistant',
    //   content: text,
    // })
    g('times').textContent = text
    // console.log(history)
  })
}

const getVenues = c => {
  history.push({
    role: 'user',
    content: `Please tell me three closest smaller venues like outdoor amphitheaters, music halls, and theaters and their distances in miles from the following coordinates: ${c}.`,
  })
  heyI(history).then(text => {
    history.push({
      role: 'assistant',
      content: text,
    })
    g('venue').textContent = text
    makeDay()
  })
}

const makeDay = () => {
  history.push({
    role: 'user',
    content: `Ok, pick one of those three venues for me and plan a full day—morning, noon, afternoon, and evening—for me with 2–4 other family-friendly restaurants or things to do near that venue.`,
  })
  heyI(history).then(text => {
    history.push({
      role: 'assistant',
      content: text,
    })
    g('schedule').textContent = text
    getMarkers(text)
    getDetails(text)
    getReviews(text)
    getTikToks(text)
  })
}

const getMarkers = () => {
  heyI([
    ...history,
    {
      role: 'user',
      content: 'For each of these places, please provide the address, latitude, and longitude in JSON format.',
    },
  ]).then(text => {
    history.push({
      role: 'assistant',
      content: text,
    })
    g('markers').textContent = text
    console.log(history)
  })
}

const getDetails = () => {
  heyI([
    ...history,
    {
      role: 'user',
      content:
        'For each of these places, please provide details on hours, pricing, good for, best time to go, and parking.',
    },
  ]).then(text => {
    history.push({
      role: 'assistant',
      content: text,
    })
    g('details').textContent = text
    console.log(history)
  })
}

const getReviews = () => {
  heyI([
    ...history,
    {
      role: 'user',
      content: 'For each of these places, please provide a few ratings and reviews from popular and trusted sources.',
    },
  ]).then(text => {
    history.push({
      role: 'assistant',
      content: text,
    })
    g('reviews').textContent = text
    console.log(history)
  })
}

const getTikToks = () => {
  tikapi('lower east side').then(obj => {
    g('videos').innerHTML = ''
    JSON.parse(obj).item_list.forEach(item => {
      const div = document.createElement('div')
      div.className = 'iphone-14 tiktok'
      div.innerText = item.video.playAddr
      g('videos').appendChild(div)
    })
  })
}

const renderCover = () => {}

const renderPlan = () => {}

const renderMap = () => {
  enrichPosition(coords)
  const map = new mapboxgl.Map({
    center: coords,
    container: 'map1',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 11,
  })
  map.addControl(new mapboxgl.NavigationControl())
  const marker1 = new mapboxgl.Marker().setLngLat(coords).addTo(map)
  // data.forEach(item => {
  //   const marker = new mapboxgl.Marker().setLngLat([item.longitude, item.latitude]).addTo(map)
  // })
}

const renderReel = () => {}

// the old prototype stuff follows

const data = [
  {
    name: 'Milwaukee Public Museum',
    image: 'https://www.milwaukeemag.com/wp-content/uploads/2022/07/05-Commons_05-scaled.jpg',
    latitude: 43.040613,
    longitude: -87.920495,
  },
]

navigator.geolocation.getCurrentPosition(
  p => {
    coords = [p.coords.longitude, p.coords.latitude]
    renderMap()
  },
  e => renderMap(),
)

q('.loading').forEach(l => (l.src = loadingGif))
