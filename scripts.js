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
  g('prompts').textContent = parseInt(g('prompts').textContent) + 1
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
    g('threads').textContent = parseInt(g('threads').textContent) + 2
  })
}

const getTimes = c => {
  heyI([
    ...history,
    {
      role: 'user',
      content: `My current time is ${dayjs().format()}. For today, tomorrow, and this weekend, tell me how many hours away from the start of the day I am, a machine-readable version of the start of the day, and the ideal window when planning activities in the current season for my timezone.`,
    },
  ]).then(text => {
    // history.push({
    //   role: 'assistant',
    //   content: text,
    // })
    g('times').textContent = text
    // console.log(history)
  })
  g('dpoints').textContent = parseInt(g('dpoints').textContent) + 12
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
  g('dpoints').textContent = parseInt(g('dpoints').textContent) + 6
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
    g('dpoints').textContent = parseInt(g('dpoints').textContent) + 6
    getMarkers(text)
    getDetails(text)
    getReviews(text)
    getTikToks(text)
    g('threads').textContent = parseInt(g('threads').textContent) + 4
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
    g('dpoints').textContent = parseInt(g('dpoints').textContent) + 18
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
    g('dpoints').textContent = parseInt(g('dpoints').textContent) + 36
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
    g('dpoints').textContent = parseInt(g('dpoints').textContent) + 18
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
    g('dpoints').textContent = parseInt(g('dpoints').textContent) + 10
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
