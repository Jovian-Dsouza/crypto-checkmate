import ChessKnights from 0x01

transaction(uuid: UInt64) {

  prepare(acct: AuthAccount) {
    ChessKnights.claimTie(gameuuid: uuid)
  }

  execute {
  }
}
