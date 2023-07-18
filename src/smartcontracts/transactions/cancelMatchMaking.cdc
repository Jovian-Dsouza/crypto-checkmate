import ChessOracleElo from 0x01
import ChessKnights from 0x01

transaction(uuid: UInt64) {
                    prepare(acct: AuthAccount) {
                      let elo <- ChessKnights.cancelWaitingMatchMaking(gameuuid: uuid)
                      //get oracle profile resource
                      let userres <- acct.load<@ChessOracleElo.Profile>(from: ChessOracleElo.profileStoragePath) ?? panic("user profile resource not found")
                      //save back the elo
                      userres.depositElo(receivingElo: <- elo)
                      //save back the resource
                      acct.save(<- userres,to:ChessOracleElo.profileStoragePath)

                    }
                  
                    execute {
                    }
                  }
