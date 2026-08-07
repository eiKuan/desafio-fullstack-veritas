import Layout from "../components/Layout";
import { DragDropProvider } from "../contexts/DragDropContext";
import BoardContainer from "../components/BoardContainer";

export default function KanbanPage() {
  return (
    <Layout>
      <DragDropProvider>
        <BoardContainer />
      </DragDropProvider>
    </Layout>
  );
}
