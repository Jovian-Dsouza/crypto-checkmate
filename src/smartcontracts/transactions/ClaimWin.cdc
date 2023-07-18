import ChessOracleElo from 0x01
import ChessKnights from 0x01

transaction(uuid: UInt64) {

  prepare(acct: AuthAccount) {
    let elo <- ChessKnights.claimWin(winner:acct.address,gameuuid: uuid)
    let profilecopy <- acct.load<@AnyResource{ChessOracleElo.ProfilePublicInterface}>(from: ChessOracleElo.profileStoragePath) ?? panic("error profile dont found")
    log("depositing elo")
    log(elo.amount)
    profilecopy.depositElo(receivingElo:<-elo)
    acct.save(<-profilecopy,to:ChessOracleElo.profileStoragePath)
    log("elo deposited")
  }

  execute {
  }
}
