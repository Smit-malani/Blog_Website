import { createSlice, current } from "@reduxjs/toolkit"

const selectedblogSlice = createSlice({
    name: "selectedblogSlice",
    initialState: JSON.parse(localStorage.getItem('selectedBlog')) || {},
    reducers: {
        addSelectedBlog(state, action){
            localStorage.setItem("selectedBlog",JSON.stringify(action.payload))
            return action.payload
        },
        removeSelectedBlog(state, action){            
            localStorage.removeItem('selectedBlog')
            return {}
        },
        setComment(state, action){
            state.comment = [...state.comment, action.payload]
        },
        setCommentLikes(state, action){
            let {commentId, userId} = action.payload
            function toogleLike(comment){ 
                return comment.map(comment => {
                    if(comment._id == commentId){
                         if(comment.likes.includes(userId)){
                            comment.likes = comment.likes.filter((like)=> like != userId)
                            return comment
                        }else{
                            comment.likes = [...comment.likes, userId]
                            return comment
                        }
                    }
                    if(comment.replice && comment.replice.length > 0){
                        return {...comment, replice: toogleLike(comment.replice)}
                    }
                    return comment
                }) 
            }
            state.comment = toogleLike(state.comment)
        },
        setReplice(state, action){
            let reply = action.payload

            function findParentComment(comments){
                let parentComment

                for( const comment of comments){
                    if(comment._id == reply.parentComment){
                        parentComment = {
                            ...comment, replice: [ ...comment.replice, reply]
                        }
                        break
                    }
                    if(comment.replice.length > 0){
                        parentComment = findParentComment(comment.replice)
                        if(parentComment){
                            parentComment = {
                                ...comment, replice:  comment.replice.map((reply)=> reply._id == parentComment._id ? parentComment : reply)
                            }
                            break
                        }
                    }
                }
                return parentComment
            }

            let parentComment = findParentComment(state.comment)
            state.comment = state.comment.map((comment) => comment._id == parentComment._id ? parentComment : comment)
        },
        setUpdatedComment(state, action){
            function updatedComment(comment){
                return comment.map((comment)=>
                    comment._id == action.payload._id ? {...comment, comment: action.payload.comment} : comment.replice && comment.replice.length > 0 ? {...comment, replice: updatedComment(comment.replice)} : comment
                )
            }
            state.comment =  updatedComment(state.comment)
        },
        deleteCommentAndReply(state, action){
            function deleteComment(comment){
                return comment.filter((comment)=> comment._id != action.payload).map((comment)=>  comment.replice && comment.replice.length > 0 ? {...comment, replice: deleteComment(comment.replice)} : comment)
            }
            state.comment = deleteComment(state.comment)
        }
    }
})

export const {addSelectedBlog, removeSelectedBlog, setComment, setCommentLikes, setReplice, setUpdatedComment, deleteCommentAndReply} = selectedblogSlice.actions
export default selectedblogSlice.reducer