import { useState, useEffect } from "react";
import { db, auth } from './firebaseConnection'; // Corrigir caminho se necessário

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
  const [user, setUsuario] = useState("");
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
      <h2>POSTS</h2>
      
      <label>ID do Post:</label>
      <input
        placeholder="ID do Post"
        value={idPost}
        onChange={(e) => setIdPost(e.target.value)}
      />
      <br />

      <label>Título:</label>
      <input
        placeholder="Título"
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <br />

      <label>Autor:</label>
      <input
        placeholder="Autor"
        type="text"
        value={autor}
        onChange={(e) => setAutor(e.target.value)}
      />
      <br />

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