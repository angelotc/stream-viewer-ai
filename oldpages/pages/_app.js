import '../styles/Home.css'
import AuthCheck from '../components/AuthCheck'

function MyApp({ Component, pageProps }) {
  return (
    <AuthCheck>
      <Component {...pageProps} />
    </AuthCheck>
  )
}

export default MyApp 