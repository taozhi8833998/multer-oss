module.exports = asset => done => {
  asset().then(() => done()).catch(done)
}