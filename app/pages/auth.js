import React, {Component} from 'react'
import Template from '../components/shared/Template'
import getUser from '../auth/getUser'
import router from 'next/router'
import {Loading} from '../components/mia-ui/loading'
import withData from '../apollo'

class Auth extends Component {

  static getInitialProps = async (ctx) => {
    try {

      let user = await getUser(ctx)
      return {
        user
      }
    } catch (ex) {
      console.log("error?", ex)
    }
  }

  render() {
    return (
      <Template>
        <Loading/>
      </Template>

    )
  }

  componentDidMount(){
    this.handleUser()
  }

  handleUser = async () => {
    try {
      console.log('hey')
      await this.setLocal()

      console.log('hello')
      let organizations = await this.getUserOrganizations()
      console.log("more")
      console.log(organizations)
      if (organizations.length === 0){
        router.push({
          pathname: '/cms/orgManager',
        }, `/new`)
      }

      for (let {role, subdomain} of organizations){
        if (role === 'pending'){
          router.push({
            pathname: '/cms/pendingApproval',
            query: {
              subdomain
            }
          }, `/${subdomain}/cms/pending`)
        } else {
          router.push({
            pathname: '/cms',
            query: {
              subdomain
            }
          }, `/${subdomain}/cms`)
        }

      }



    } catch (ex) {
      console.error(ex)
    }
  }

  setLocal = async () => {
    try {

        let {
          idToken,
          id
        } = this.props.user

        localStorage.setItem('userId', id)
        localStorage.setItem('idToken', idToken)


    } catch (ex) {
      console.error(ex)
    }
  }


  getUserOrganizations= async() => {
    try {
      const response = await fetch(process.env.API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            user (id:"${this.props.user.id}") {
              id
              email
              organizations {
                id
                subdomain
                role
              }
            }
          }`
        })
      })

      let json = await response.json()

      return json.data.user.organizations
    } catch (ex) {
      console.error(ex)
    }
  }


}


export default withData(Auth)
