export default `
(def defmacro (macro (name args *body) (def name (macro args *body))))
(def defun (macro (name args *body) (def name (lambda args *body))))
`;
