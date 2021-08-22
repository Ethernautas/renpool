import constants as C

net = C.NETWORKS['MAINNET_FORK']
darknodeRegistryStoreAddr = C.CONTRACT_ADDRESSES[net]['DARKNODE_REGISTRY_STORE']

NODE_ID = '0x0000000000000000000000000000000000000001' # some ETH address
PUBLIC_KEY = '0x000000077373682d727361000000030100010000010100d0feba4ae65ea9ad771d153419bcc21189d954b6bf75fd5488055cd2641231014f190c0e059a452d301c535e931df33590ec0e18c59341a2766cc885d1dc6e66f5cc65b94522ec944ae4200bd56a30223328b258d50b507dd94b4c4742768f3fec2b815c9c4b0fe26727e82865f6a064fa3ff2443d135d9788095a1c17487fd5c389a491c16b73385d516a303debc3bcccae337a7ec0d89d51ce05262a0c4c1f2178466c85379b8cd4e5cbe1c90a05fb0c1ed3eee2134774b450e7b0b70c792abad55beef919e21a03cb9de4e963a820c2f84421a4559d0b67cfd17c1686ff6f2d1bb07ac2c82cede1cf5f16a57e125a29fef65891715b061606bca1a0eb026b'

def test_darknode_registration_happy_path(owner, admin, ren_pool, ren_token):
    """
    Test node registration happy path.
    """
    assert ren_pool.totalPooled() == 0
    assert ren_pool.isLocked() == False

    # Lock the pool
    ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
    ren_pool.deposit(C.POOL_BOND, {'from': owner})
    assert ren_pool.isLocked() == True
    assert ren_pool.totalPooled() == C.POOL_BOND

    init_balance = ren_token.balanceOf(darknodeRegistryStoreAddr)

    ren_pool.approveBondTransfer({'from': admin})
    ren_pool.registerDarknode(NODE_ID, PUBLIC_KEY, {'from': admin})

    # Funds are stored on the DarknodeRegistryStore contract instead of the DarknodeRegistry
    assert ren_token.balanceOf(darknodeRegistryStoreAddr) == init_balance + C.POOL_BOND
    assert ren_token.balanceOf(ren_pool) == 0

# TODO: test remaining paths
# def test_darknode_registration_fails_if_unapproved(owner, admin, ren_pool, ren_token):
#     """
#     Test node registration fails if unapproved.
#     """
#     assert ren_pool.totalPooled() == 0
#     assert ren_pool.isLocked() == False

#     # Lock the pool
#     ren_token.approve(ren_pool, C.POOL_BOND, {'from': owner})
#     ren_pool.deposit(C.POOL_BOND, {'from': owner})
#     assert ren_pool.isLocked() == True
#     assert ren_pool.totalPooled() == C.POOL_BOND

#     init_balance = ren_token.balanceOf(darknodeRegistryStoreAddr)

#     # ren_pool.approveBondTransfer({'from': admin})
#     ren_pool.registerDarknode(NODE_ID, PUBLIC_KEY, {'from': admin})

#     # assert ren_token.balanceOf(darknodeRegistryStoreAddr) == init_balance + C.POOL_BOND
#     # assert ren_token.balanceOf(ren_pool) == 0
