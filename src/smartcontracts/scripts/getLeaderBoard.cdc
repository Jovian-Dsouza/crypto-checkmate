import ChessOracleElo from 0x01

pub fun main(): [ChessOracleElo.UserData] {
  return ChessOracleElo.getLeaderBoard()
}
