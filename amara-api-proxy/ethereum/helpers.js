exports.setAmaraApiUrl = async (taskAllocationContract, url) => {
  try {
    taskAllocationContract.methods.setApiUrl(url).send()
  } catch (err) {
    console.error('There was a problem trying to set api url: ', err)
  }
}
