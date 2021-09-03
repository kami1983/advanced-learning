import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  // 新增数据状态
  const [kitties_obj_list, setKittiesObjList] = useState([])
  const [owner_obj_list, setOwnerObjList] = useState([])



  const fetchKitties = () => {
    console.log('LIN DEBUG:: 理论上 fetchKitties 值第一次初始API时运行，除非 api, keyring 发生变化')
    // 获取一共有多少猫咪
    api.query.kittiesModule.kittiesCount(d => {
      if (d.isSome) {
        // 获取猫咪的数量，并更新 state
        let kitty_count = d.unwrap().toNumber()
        console.log('DEBUG:: 猫的数量 = ', kitty_count)

        // 因为 Kitty Index 是连续的，所以初始一个数组来进行 Kitty Id 的初始化。
        let tmp_kitty_index_list = []
        for(let i=0 ; i< d.unwrap().toNumber() ; i++ ) {
          tmp_kitty_index_list.push(i)
        }
        console.log("所有Kitty猫的Index = ", tmp_kitty_index_list)

        // 获取所有 kitty 猫的数据
        api.query.kittiesModule.kitties.multi(tmp_kitty_index_list, (kitties_list) => {
          let kitties_obj_list = []
          for (let i in kitties_list) {
            if (kitties_list[i].isSome) {
              let kitty_obj = kitties_list[i].unwrap().toU8a()
              console.log(`当前获取到的 Kitty obj 【${i}】 = `, kitty_obj)
              // 添加到 kitties 列表中。
              kitties_obj_list.push(kitty_obj)
            }
          }
          setKittiesObjList(kitties_obj_list)
        })

        // 获取所有猫咪的主人数据
        api.query.kittiesModule.owner.multi(tmp_kitty_index_list, (owners) => {
          let owner_obj_list = []
          for (let i in owners) {
            if (owners[i].isSome) {
              const owner_obj = owners[i].unwrap().toString()
              console.log(`Owner data = 【${i}】 = `, owner_obj)
              owner_obj_list.push(owner_obj)
            }
          }
          setOwnerObjList(owner_obj_list)
        })
      }
    })
  }

  const populateKitties = () => {

    console.log('LIN DEBUG::这个应该 kitty_data_list 发生变化时变化')
    // 封装数据
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理
    const kitties = []
    for(let kitty_id=0 ; kitty_id< kitties_obj_list.length; kitty_id++ ){
      kitties.push({
        id: kitty_id,
        dna: kitties_obj_list[kitty_id],
        owner: owner_obj_list[kitty_id],
      })
    }

    console.log('打印一下封装好的数据 ',kitties)
    setKitties(kitties)
  }

  // 第一个参数是一个函数在页面刷新的时候和后面状态变更的时候被执行
  // useEffect(fetchKitties, [api, keyring])
  useEffect(fetchKitties, [])

  // 第一个参数是一个函数在页面刷新的时候和后面状态变更的时候被执行
  useEffect(populateKitties, [kitties_obj_list, owner_obj_list])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
