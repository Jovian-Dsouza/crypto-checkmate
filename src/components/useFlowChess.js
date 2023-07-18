import * as fcl from "@onflow/fcl";

export default class useFlowChess {
    async scriptGetAddressProfile(address){
        console.log('script is signed up',address)
        try {
            const response = await fcl.query({
                cadence: `
                import ChessOracleElo from 0xed4dad55d4060467

                pub fun main(address: Address): ChessOracleElo.UserData {
                //get capability of for the user profile
                let addr = getAccount(address)
                let ref = addr.getCapability<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(ChessOracleElo.profilePublicPath).borrow() ?? panic("no user profile")
                //get the userData of the account
                let userData = ref.getProfileData()
                log(userData)
                return userData
                }

                
                `,
                args: (arg, t) => [
                    arg(`${address}`, t.Address),
                ]
            },)
            return {status:"succes",data:response}
        }catch(err){
            return {status:"fail",data:err}
        }
    }

    async scriptGetGameUuid (address){
        console.log('script is signed up',address)
        try {
            const response = await fcl.query({
                cadence: `
                import ChessKnights from 0xed4dad55d4060467

                pub fun main(address: Address): UInt64 {
                    //get capability of for the user profile
                    let addr = getAccount(address)
                    let ref = addr.getCapability<&AnyResource{ChessKnights.UserProfilePublicInterface}>(ChessKnights.userProfilePublicPath).borrow() ?? panic("no user profile")
                    //get the userData of the account
                    let userData = ref.ongoinggameuuid
                    log(userData)
                    return userData
                  }

                
                `,
                args: (arg, t) => [
                    arg(`${address}`, t.Address),
                ]
            },)
            return {status:"succes",data:response}
        }catch(err){
            return {status:"fail",data:err}
        }
    }


    async transactionEnterMacthMaking (address){
        try {
            let startuuid = 0;
            let uuid = 0;
            //get pre matchmaking uuid
            let data = await this.scriptGetGameUuid(address)
            if(data.status!="fail"){
                startuuid = data.data
                uuid = data.data
            }
            console.log("start uuid",startuuid,uuid)

            //get actual uuid
            let response = await fcl.mutate({
                cadence: `
                import ChessOracleElo from 0xed4dad55d4060467
                import ChessKnights from 0xed4dad55d4060467
                
                transaction {
                
                    prepare(acct: AuthAccount) {
                    //SETUP CHESS ORACLE ACCOUNT IF ITS NOT
                    // extract Profile resource of the account
                    let profilecopy <- acct.load<@AnyResource{ChessOracleElo.ProfilePublicInterface}>(from: ChessOracleElo.profileStoragePath)
                    // if there is not any resrource of the profile create one else save the extracted one
                    if(profilecopy == nil){
                        //get the user address as required field for the function
                        let address = acct.address.toString()

                        //create a new UserSwitchBoard resource
                        let newUserProfileResource <- ChessOracleElo.createNewProfile(userAddress: acct.address)

                        //save the resource in account storage
                        acct.save(<- newUserProfileResource,to:ChessOracleElo.profileStoragePath)
                        
                        //create a private link to the storage path
                        acct.link<&AnyResource{ChessOracleElo.ProfilePublicInterface}>(ChessOracleElo.profilePublicPath,target:ChessOracleElo.profileStoragePath)
                        log("account profile created")
                        // destroy the resource as its null
                        destroy profilecopy
                    }else{
                        // save the extracted resource
                        // We use the force-unwrap operator  to get the value
                        // out of the optional. It aborts if the optional is nil
                        acct.save(<-profilecopy!,to:ChessOracleElo.profileStoragePath)
                        log("account profile was already created")
                    }
                    //SETUP ChessKnights ACCOUNT IF ITS NOT
                    // extract Profile resource of the account
                    let profilecopyknights <- acct.load<@AnyResource{ChessKnights.UserProfilePublicInterface}>(from: ChessKnights.userProfileStoragePath)
                    // if there is not any resrource of the profile create one else save the extracted one
                    if(profilecopyknights == nil){
                        //create a new UserSwitchBoard resource
                        let newUserProfileResource <- ChessKnights.createProfile(name:"anonymus")

                        //save the resource in account storage
                        acct.save(<- newUserProfileResource,to:ChessKnights.userProfileStoragePath)
                        
                        //create a private link to the storage path
                        acct.link<&AnyResource{ChessKnights.UserProfilePublicInterface}>(ChessKnights.userProfilePublicPath,target:ChessKnights.userProfileStoragePath)
                        log("account profile created")
                        // destroy the resource as its null
                        destroy profilecopyknights
                    }else{
                        // save the extracted resource
                        // We use the force-unwrap operator  to get the value
                        // out of the optional. It aborts if the optional is nil
                        acct.save(<-profilecopyknights!,to:ChessKnights.userProfileStoragePath)
                        log("account profile was already created")
                    }
                    //get elo vault
                    let resource <- acct.load<@ChessOracleElo.Profile>(from: ChessOracleElo.profileStoragePath) ?? panic("user has not started his account")
                    let elo <- resource.withdrawEloForaMatch()
                    //enter matchmaking
                    let uuid = ChessKnights.enterMatchMaking(player1: acct.address, elo: <- elo)
                    //extract the chessknights resource
                    let resourceknights <- acct.load<@ChessKnights.UserProfile>(from: ChessKnights.userProfileStoragePath) ?? panic("user has not started his account")
                    //set the active game uuid
                    resourceknights.updateOnGoingGameUuid(uuid: uuid)
                    //save back the user resources
                    acct.save(<-resource,to:ChessOracleElo.profileStoragePath)
                    acct.save(<-resourceknights,to:ChessKnights.userProfileStoragePath)
                    log(uuid)
                  }
                
                  execute {
                  }
                }
                

                `
                ,
                args: (arg, t) => [
                ],
                payer: fcl.authz,
                proposer: fcl.authz,
                authorizations: [fcl.authz],
                limit: 500
            });
            let trys = 0
            while(uuid==startuuid && trys < 1000){
                let newdata;
                try{                
                     newdata = await this.scriptGetGameUuid(address)
                     console.log("new dqata",newdata)
                     console.log(newdata.data)
                     if(newdata.data!=startuuid){
                        if(newdata.status != "fail"){
                            uuid = newdata.data
                        }
                    }
                    trys += 1
                    console.log(trys,newdata.data)
                }
                catch(err){
                    //console.log('error getting uuid',err)
                }
                
            }
            
            return {status:"succes",data:response,uuid:uuid}
        } catch (err) {
            console.log('err',err);
            return {status:"fail",data:err}
        }
    }

    async transactionStopMacthMaking (uuid){
        try {
            let response = await fcl.mutate({
                cadence: `
                import ChessOracleElo from 0xed4dad55d4060467
                import ChessKnights from 0xed4dad55d4060467
                
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
                

                `
                ,
                args: (arg, t) => [
                    arg(`${uuid}`, t.UInt64),
                ],
                payer: fcl.authz,
                proposer: fcl.authz,
                authorizations: [fcl.authz],
                limit: 500
            });
            return {status:"succes",data:response}
        } catch (err) {
            console.log('err',err);
            return {status:"fail",data:err}
        }
    }

    async transactionClaimWin (uuid){
        try {
            let response = await fcl.mutate({
                cadence: `
                import ChessOracleElo from 0xed4dad55d4060467
                import ChessKnights from 0xed4dad55d4060467
                
                transaction(uuid: UInt64) {
                
                  prepare(acct: AuthAccount) {
                    let elo <- ChessKnights.claimWin(winner:acct.address,gameuuid: uuid)
                    let profilecopy <- acct.load<@AnyResource{ChessOracleElo.ProfilePublicInterface}>(from: ChessOracleElo.profileStoragePath) ?? panic("error profile dont found")
                    log("depositing elo")
                    log(elo.amount)
                    profilecopy.depositElo(receivingElo:<-elo)
                    acct.save(<-profilecopy,to:ChessOracleElo.profileStoragePath)
                    log("elo deposited")
                    ChessOracleElo.updateLeaderBoard(address:acct.address)
                  }
                
                  execute {
                  }
                }
                
                `
                ,
                args: (arg, t) => [
                    arg(`${uuid}`, t.UInt64),
                ],
                payer: fcl.authz,
                proposer: fcl.authz,
                authorizations: [fcl.authz],
                limit: 500
            });
            return {status:"succes",data:response}
        } catch (err) {
            console.log('err',err);
            return {status:"fail",data:err}
        }
    }

    async transactionEClaimTie (uuid){
        try {
            let response = await fcl.mutate({
                cadence: `
                import ChessOracleElo from 0xed4dad55d4060467
                import ChessKnights from 0xed4dad55d4060467
                
                transaction(uuid: UInt64) {
                
                  prepare(acct: AuthAccount) {
                    ChessKnights.claimTie(gameuuid: uuid)
                    log("tie completed successfully")
                  }
                
                  execute {
                  }
                }
                

                `
                ,
                args: (arg, t) => [
                    arg(`${uuid}`, t.UInt64),
                ],
                payer: fcl.authz,
                proposer: fcl.authz,
                authorizations: [fcl.authz],
                limit: 500
            });
            return {status:"succes",data:response}
        } catch (err) {
            console.log('err',err);
            return {status:"fail",data:err}
        }
    }

}

