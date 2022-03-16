import csvtojson from 'csvtojson'

const ownerWallet = '0x72571d815dd31fbde52be0b9d7ffc8344aede616' // todo what for?
const polkastarterWallet = '0xee62650fa45ac0deb1b24ec19f983a8f85b727ab'
const pankcakeSwapWallet = '0xd6d206f59cc5a3bfa4cc10bc8ba140ac37ad1c89'

export const totalQuantity = arr => arr.reduce((sum, i) => sum += getQuantity(i.Quantity), 0)

const getQuantity = val => +val.replace(/,/g, '')

export const getCsvData = async (fileName) => {
  const file = await fetch(fileName)
  const csv = await file.text()

  return csvtojson().fromString(csv)
}

export const getSankeyData = async (fileName) => {
  const nodes = [
    { 'id': 'Polkastarter', color: 'blue' },
    { 'id': 'PancakeSwap', color: 'red' },
    { 'id': 'Second wallet', color: 'yellow' },
    { 'id': 'Third wallet', color: 'purple' },
    { 'id': 'HODL', color: 'green' }
  ];
  const links = []

  const data = await getCsvData(fileName)

  const toOwner = []
  const toPolkastarter = []
  const fromPolkastarterToPankcakeSwap = []
  const fromPolkastarterToSecondWallet = []
  const fromSecondWalletToPankcakeSwap = []
  const fromSecondWalletToThirdWallet = []
  const secondWallets = {}

  data.forEach((d) => {
    if (d.From === '0x0000000000000000000000000000000000000000' && d.To === ownerWallet) return toOwner.push(d)

    if (d.To === polkastarterWallet) return toPolkastarter.push(d)

    if (d.From === polkastarterWallet) {
      if (d.To === pankcakeSwapWallet) return fromPolkastarterToPankcakeSwap.push(d)

      if (d.To !== pankcakeSwapWallet) {
        fromPolkastarterToSecondWallet.push(d)

        secondWallets[d.To] = true
      }
    }
  })

  data.forEach(d => {
    if (!secondWallets[d.From]) return

    if (d.To === pankcakeSwapWallet) return fromSecondWalletToPankcakeSwap.push(d)

    if (d.To !== pankcakeSwapWallet) return fromSecondWalletToThirdWallet.push(d)
  })

  const fromPolkastarterToPankcakeSwapTotal = totalQuantity(fromPolkastarterToPankcakeSwap)
  const fromPolkastarterToSecondWalletTotal = totalQuantity(fromPolkastarterToSecondWallet)
  const fromPolkastarterToHODLTotal = totalQuantity(toPolkastarter) -
    (fromPolkastarterToPankcakeSwapTotal + fromPolkastarterToSecondWalletTotal)
  const fromSecondWalletToPankcakeSwapTotal = totalQuantity(fromSecondWalletToPankcakeSwap)
  const fromSecondWalletToThirdWalletTotal = totalQuantity(fromSecondWalletToThirdWallet)
  const fromSecondWalletToHODLTotal = fromPolkastarterToSecondWalletTotal -
    (fromSecondWalletToPankcakeSwapTotal + fromSecondWalletToThirdWalletTotal)

  if (fromPolkastarterToPankcakeSwapTotal) {
    links.push({
      source: 'Polkastarter',
      target: 'PancakeSwap',
      color: 'blue',
      value: fromPolkastarterToPankcakeSwapTotal
    });
  }

  if (fromPolkastarterToSecondWalletTotal) {
    links.push({
      source: 'Polkastarter',
      target: 'Second wallet',
      color: 'blue',
      value: fromPolkastarterToSecondWalletTotal
    });
  }

  if (fromPolkastarterToHODLTotal) {
    links.push({
      source: 'Polkastarter',
      target: 'HODL',
      color: 'blue',
      value: fromPolkastarterToHODLTotal
    });
  }

  if (fromSecondWalletToPankcakeSwapTotal) {
    links.push({
      source: 'Second wallet',
      target: 'PancakeSwap',
      color: 'yellow',
      value: fromSecondWalletToPankcakeSwapTotal
    });
  }

  if (fromSecondWalletToThirdWalletTotal) {
    links.push({
      source: 'Second wallet',
      target: 'Third wallet',
      color: 'yellow',
      value: fromSecondWalletToThirdWalletTotal
    });
  }

  if (fromSecondWalletToHODLTotal) {
    links.push({
      source: 'Second wallet',
      target: 'HODL',
      color: 'yellow',
      value: fromSecondWalletToHODLTotal
    });
  }

  return {
    nodes,
    links,
    transactions: [
      ...fromPolkastarterToPankcakeSwap,
      ...fromPolkastarterToSecondWallet,
      ...fromSecondWalletToPankcakeSwap,
      ...fromSecondWalletToThirdWallet,
    ]
  }
}
