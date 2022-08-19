// import ObjectsToCsv from 'objects-to-csv'
// import { join } from 'path'
// const csv = new ObjectsToCsv(players)
// await csv.toDisk(join(__dirname, '/players.csv'), { bom: true })
// console.log('file saved')

import { getPageContent } from '../Content'
import { allFilterPlayers, BASE_URL } from '../Constants'

const playerUrl = (id: string | number) => `${BASE_URL}/player/${id}`

export const getPlayerPage = async (playerId: string | number) => {
  const url = playerUrl(playerId)

  const page = await getPageContent(url)

  await page.waitForSelector('.col > .player')

  const player = await page.$eval('body', (node) => {
    const nationLink = node.querySelector('.info > .meta > a')
    const playerCardInfo = node.querySelectorAll('.player > .card .block-quarter')
    const playerAttributes = node.querySelectorAll('.grid > .col.col-12 > .block-quarter')

    const metaText = node.querySelector('.info > .meta').innerText

    const age = Number(/([0-9]\w+y.o.)/.exec(metaText)?.[0]?.replace(/\D/g, ''))
    const born = /\(([^\)]+)\)/.exec(metaText)?.[0].replace('(', '').replace(')', '')
    const bornTimestamp = born ? new Date(born).toISOString() : undefined

    const height = Number(/([0-9]\w+cm)/.exec(metaText)?.[0]?.replace(/\D/g, ''))
    const weight = Number(/([0-9]\w+kg)/.exec(metaText)?.[0]?.replace(/\D/g, ''))

    const attributes = {}

    playerAttributes.forEach((element, index) => {
      if (index === 0 || index === 2) {
        element.querySelectorAll('ul li').forEach(attribute => {
          if (!attribute.querySelector('label')) return
          
          const attributeKey = attribute.querySelector('label').innerText
          const attributeValue = attribute.innerText.replace(attributeKey, '').replace(' ', '')

          attributes[attributeKey.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())] =
            attributeValue.replace(' ', '')
        })
      }

      if (index >= 3 && index <= 9) {
        element.querySelectorAll('ul li').forEach(attribute => {
          const innerText = attribute.innerText.replace(' ', '')

          attributes[innerText.replace(/[0-9]/g, '').toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())] =
            Number(innerText.replace(/\D/g, ''))
        })
      }
    })

    return {
      name: node.querySelector('h1.ellipsis').innerText,
      fullName: node.querySelector('.info > h1').innerText,
      age,
      born,
      ...(bornTimestamp ? { bornTimestamp } : {}),
      height,
      weight,
      imageUrl: node.querySelector('.player > img').getAttribute('src'),
      nationName: nationLink.getAttribute('title'),
      nationId: Number(nationLink.getAttribute('href').replace(/\D/g, '')),
      position: node.querySelector('.info .pos').innerText,
      overallRating: Number(playerCardInfo[0].querySelector('span').innerText),
      overallPotential: Number(playerCardInfo[1].querySelector('span').innerText),
      value: playerCardInfo[2].innerText.replace(playerCardInfo[2].querySelector('.sub').innerText, ""),
      wage: playerCardInfo[3].innerText.replace(playerCardInfo[3].querySelector('.sub').innerText, ""),
      ...attributes
    }
  })

  await page.browser().close()

  return player
}

export const getPlayersSearch = async (offset: string | number = 0, filters?: { [key: string]: string }) => {
  const url = new URL(`${BASE_URL}/players`)

  const filtersProps = {
    type: 'all',
    ...filters
  }
  
  allFilterPlayers.forEach((value) => {
    url.searchParams.append('showCol[]', value)
  })

  Object.entries(filtersProps).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  if (Number(offset) > 0) {
    url.searchParams.append('offset', offset+'')
  }

  const page = await getPageContent(url.href)

  const players = await page.$$eval('table tbody tr', (nodes) => nodes.map((node) => {
    const positionNodes = node.querySelectorAll(".col-name .pos")
    const  positions = []
    for (let position of positionNodes) {
      positions.push(position.textContent);
    }

    return {
      fifPlayerId: Number(node.querySelector(".col-pi").textContent),
      name: node.querySelector(".col-name > a > div").textContent,
      fullName: node.querySelector(".col-name > a").getAttribute('aria-label'),
      age: Number(node.querySelector(".col-ae").textContent),
      club: node.querySelector(".col-name > div > a").textConten,
      overallRating: Number(node.querySelector(".col-oa .p").textContent),
      overallPotential: Number(node.querySelector(".col-pt .p").textContent),
      nationName: node.querySelector('.col-name > img').getAttribute('title'),
      positions,

      height: node.querySelector(".col-hi").textContent,
      weight: node.querySelector(".col-wi").textContent,

      preferredFoot: node.querySelector(".col-pf").textContent,
      weakFoot: Number(node.querySelector(".col-wk").textContent.replace(' ', '')),
      skillMoves: Number(node.querySelector(".col-sk").textContent),

      value: node.querySelector(".col-vl").textContent,
      wage: node.querySelector(".col-wg").textContent,
      releaseClause: node.querySelector(".col-rc").textContent,

      attackingWorkrate: node.querySelector(".col-aw").textContent,
      defensiveWorkrate: node.querySelector(".col-dw").textContent,

      stats: {
        crossing: node.querySelector(".col-cr").textContent,
        finishing: node.querySelector(".col-fi").textContent,
        headingAccuracy: node.querySelector(".col-he").textContent,
        shortPassing: node.querySelector(".col-sh").textContent,
        volleys: node.querySelector(".col-vo").textContent,
        dribbling: node.querySelector(".col-dr").textContent,
        curve: node.querySelector(".col-cu").textContent,
        fkAccuracy: node.querySelector(".col-fr").textContent,
        longPassing: node.querySelector(".col-lo").textContent,
        ballControl: node.querySelector(".col-bl").textContent,
        acceleration: node.querySelector(".col-ac").textContent,
        sprintSpeed: node.querySelector(".col-sp").textContent,
        agility: node.querySelector(".col-ag").textContent,
        reactions: node.querySelector(".col-re").textContent,
        balance: node.querySelector(".col-ba").textContent,
        shotPower: node.querySelector(".col-so").textContent,
        jumping: node.querySelector(".col-ju").textContent,
        stamina: node.querySelector(".col-st").textContent,
        strength: node.querySelector(".col-sr").textContent,
        longShots: node.querySelector(".col-ln").textContent,
        aggression: node.querySelector(".col-ar").textContent,
        interceptions: node.querySelector(".col-in").textContent,
        positioning: node.querySelector(".col-po").textContent,
        vision: node.querySelector(".col-vi").textContent,
        penalties: node.querySelector(".col-pe").textContent,
        composure: node.querySelector(".col-cm").textContent,
        defensiveAwareness: node.querySelector(".col-ma").textContent,
        standingTackle: node.querySelector(".col-sa").textContent,
        slidingTackle: node.querySelector(".col-sl").textContent,
        gkDiving: node.querySelector(".col-gd").textContent,
        gkHandling: node.querySelector(".col-gh").textContent,
        gkKicking: node.querySelector(".col-gc").textContent,
        gkPositioning: node.querySelector(".col-gp").textContent,
        gkReflexes: node.querySelector(".col-gr").textContent,
      },

      images: {
        playerImg: node.querySelector(".col-avatar img").getAttribute('data-src'),
        nationImg: node.querySelector(".col-name img").getAttribute('data-src'),
        teamImg: node.querySelector(".col-name > div img").getAttribute('data-src'),
      },
      urls: {
        playerUrl: node.querySelector(".col-name > a").getAttribute('href'),
        teamUrl: node.querySelector(".col-name > div.ellipsis > a").getAttribute('href'),
      }
    }
  }))

  const hasNewPage = await page.$eval('.card .pagination', (node) => {
    const nextButton = node.querySelector('span.bp3-icon-chevron-right')

    if (!nextButton) return false

    return new URLSearchParams(nextButton.parentNode.getAttribute('href')).get('offset')
  })

  return {
    players,
    hasNewPage
  }
}
