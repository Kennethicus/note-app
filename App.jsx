import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { addDoc, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore"
import { notesCollection, database } from "./firebase"

export default function App() {
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    
    const [tempNoteText, setTempNoteText] = React.useState("")
    
    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]

    
   
        const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)



    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
            //Sync local up our local notes array with the snapshot x`data
            const notesArr = snapshot.docs.map( document => ({
                ...document.data(),
                id: document.id
            }))
            setNotes(notesArr)
            console.log("Thing are changing")
        })

        return unsubscribe
    }, [])


    React.useEffect(() => {
        if (!currentNoteId){
            setCurrentNoteId(notes[0]?.id)
        }
    },[notes])

    React.useEffect(() => {
        if (currentNote) {
            setTempNoteText(currentNote.body)
        }
    }, [currentNote])


    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if(tempNoteText !== currentNote.body){
                updateNote(tempNoteText)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [tempNoteText])

     
    // ? Generate id from firestore 
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
      const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }

    async function updateNote(text) { 
        const docRef = doc(database, "notes", currentNoteId)
        await setDoc(docRef, {body: text, updatedAt: Date.now()}, {merge: true} )
    }

    async function deleteNote(noteId) {
        const docRef = doc(database, "notes", noteId)
        await deleteDoc(docRef)
    }

    return (
        <main>
            {
                notes.length > 0
                    ? 
                    <Split 
                        sizes={[30, 70]} 
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                
                            <Editor
                                tempNoteText={tempNoteText}
                                setTempNoteText={setTempNoteText}
                            />
                        
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
