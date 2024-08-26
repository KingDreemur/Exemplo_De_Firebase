import { useState, useEffect } from "react";
import { db, auth } from './firebaseConnection'; 

import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

function App() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [idPost, setIdPost] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [posts, setPosts] = useState([]);
  const [user, setUsuario] = useState(null);
  const [detalheUser, setDetalheUser] = useState({});

  useEffect(() => {
    async function carregarPosts() {
      const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
        let listaPost = [];

        snapshot.forEach((doc) => {
          listaPost.push({
            id: doc.id,
            titulo: doc.data().titulo,
            autor: doc.data().autor,
          });
        });

        setPosts(listaPost);
      });

      return () => unsubscribe();
    }
    
    carregarPosts();
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(true); // Se tem usuário logado
        setDetalheUser({
          id: user.uid,
          email: user.email
        });
      } else {
        setUsuario(false); // Se não tem usuário logado
        setDetalheUser({});
      }
    });
  }, []);

  async function novoUsuario() {
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      setEmail("");
      setSenha("");
    } catch (error) {
      if (error.code === "auth/weak-password") {
        alert("Senha muito fraca!");
      } else if (error.code === "auth/email-already-in-use") {
        alert("Email já cadastrado!");
      } else {
        alert("Erro ao criar usuário!");
      }
    }
  }

  async function logarUsuario() {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setDetalheUser({
        id: userCredential.user.uid,
        email: userCredential.user.email
      });
      setEmail("");
      setSenha("");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  async function fazerLogout() {
    await signOut(auth);
    setUsuario(false);
    setDetalheUser({});
  }

  async function adicionarPosts() {
    if (titulo === "" || autor === "") {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        titulo,
        autor,
      });
      console.log("Cadastro realizado com sucesso");
      setAutor("");
      setTitulo("");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  async function buscarPost() {
    const dados = collection(db, "posts");

    try {
      const snapshot = await getDocs(dados);
      let listaPost = [];

      snapshot.forEach((doc) => {
        listaPost.push({
          id: doc.id,
          titulo: doc.data().titulo,
          autor: doc.data().autor,
        });
      });

      setPosts(listaPost);
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  async function editarPost() {
    if (idPost === "") {
      alert("Preencha o ID do post!");
      return;
    }

    const postEditado = doc(db, "posts", idPost);

    try {
      await updateDoc(postEditado, {
        titulo,
        autor
      });
      console.log("Post editado com sucesso");
      setIdPost("");
      setTitulo("");
      setAutor("");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  async function excluirPost(id) {
    const postExcluido = doc(db, "posts", id);

    try {
      await deleteDoc(postExcluido);
      alert("Post excluído com sucesso");
    } catch (error) {
      console.log("Erro: " + error);
    }
  }

  return (
    <div>
      <h1>React JS + Firebase</h1>
        
      { user && (
        <div>
          <strong>Seja bem-vindo(a) Você esta logado!</strong>
          <span>ID: {detalheUser.id} - Email: {detalheUser.email}</span>
          <br/>
          <button onClick={fazerLogout}>Sair</button>
        </div>
      )}



      <h2>Usuário</h2>

      <label>Email:</label>
      <input
        placeholder="Insira um Email"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />

      <label>Senha:</label>
      <input
        placeholder="Insira uma Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      /><br />
      <button onClick={novoUsuario}>Cadastrar</button>
      <button onClick={logarUsuario}>Login</button>
      <button onClick={fazerLogout}>Logout</button>
      <br />

      <hr />
      <h2>POSTS</h2>

      <label>ID do Post:</label>
      <input
        placeholder="ID do Post"
        value={idPost}
        onChange={(e) => setIdPost(e.target.value)}
      /><br />

      <label>Título:</label>
      <input
        placeholder="Título"
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      /><br />

      <label>Autor:</label>
      <input
        placeholder="Autor"
        type="text"
        value={autor}
        onChange={(e) => setAutor(e.target.value)}
      /><br />

      <button onClick={adicionarPosts}>Adicionar</button>
      <button onClick={buscarPost}>Buscar</button>
      <button onClick={editarPost}>Editar</button>

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <strong>ID: {post.id}</strong><br />
            <strong>Título: {post.titulo}</strong><br />
            <strong>Autor: {post.autor}</strong><br />
            <button onClick={() => excluirPost(post.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;